from django.core.management.base import BaseCommand
from music.models import Artist, Album, Song


class Command(BaseCommand):
    help = 'Quét database để gom nhóm bài hát vào Album (Hỗ trợ nhiều nghệ sĩ)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Đang đồng bộ hóa Album...")

        # Lấy tất cả bài hát chưa có Album
        orphaned_songs = Song.objects.filter(album__isnull=True)

        count = 0
        for song in orphaned_songs:
            # Lấy nghệ sĩ đầu tiên của bài hát để đặt tên Album
            first_artist = song.artists.first()
            if not first_artist:
                continue

            # Tên album dự kiến
            album_title = f"Tuyển tập {first_artist.name}"

            # Tìm hoặc tạo Album (Lưu ý: Không dùng artist=... để lọc nữa)
            album_obj, created = Album.objects.get_or_create(title=album_title)

            # Gán bài hát vào album
            song.album = album_obj
            song.save()

            # Album sẽ chứa tất cả nghệ sĩ của các bài hát bên trong nó
            song_artists = song.artists.all()
            album_obj.artists.add(*song_artists)

            # Cập nhật cover nếu album chưa có
            if (not album_obj.cover_image or 'default' in str(album_obj.cover_image)) and song.cover_image:
                album_obj.cover_image = song.cover_image
                album_obj.save()

            count += 1
            self.stdout.write(f"- Đã gom '{song.title}' vào '{album_title}'")

        self.stdout.write(self.style.SUCCESS(f'--- Đã xử lý {count} bài hát lẻ ---'))