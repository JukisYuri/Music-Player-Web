import os
from django.core.management.base import BaseCommand
from django.conf import settings
from music.models import Song, Artist, Album
from mutagen.mp3 import MP3
from mutagen.id3 import ID3

class Command(BaseCommand):
    help = 'Quét file nhạc từ thư mục data/music và lưu vào Database'

    def handle(self, *args, **kwargs):
        music_dir = os.path.join(settings.MEDIA_ROOT, 'mp3')

        if not os.path.exists(music_dir):
            self.stdout.write(self.style.ERROR(f'Không tìm thấy thư mục: {music_dir}'))
            return

        files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
        self.stdout.write(f'Tìm thấy {len(files)} file nhạc. Đang xử lý...')
        count = 0

        for filename in files:
            file_path = os.path.join(music_dir, filename)
            try:
                # 1. Đọc Metadata
                try:
                    tags = ID3(file_path)
                    audio = MP3(file_path)
                    title = str(tags.get('TIT2')) if tags.get('TIT2') else filename.replace('.mp3', '')
                    artist_name = str(tags.get('TPE1')) if tags.get('TPE1') else "Unknown Artist"
                    album_name = str(tags.get('TALB')) if tags.get('TALB') else f"Tuyển tập {artist_name}"
                    duration = int(audio.info.length)
                except Exception:
                    # Fallback nếu file không có metadata chuẩn
                    title = filename.replace('.mp3', '')
                    artist_name = "Unknown Artist"
                    album_name = "Unknown Album"
                    duration = 0

                # 2. Tạo DB
                artist_obj, _ = Artist.objects.get_or_create(name=artist_name)
                album_obj, _ = Album.objects.get_or_create(title=album_name, artist=artist_obj)

                relative_path = os.path.join('mp3', filename)

                # Update hoặc Create
                obj, created = Song.objects.update_or_create(
                    title=title,
                    artist=artist_obj,
                    defaults={
                        'album': album_obj,
                        'audio_file': relative_path,
                        'duration': duration
                    }
                )

                action = "Thêm mới" if created else "Cập nhật"
                self.stdout.write(f'- {action}: {title}')
                count += 1

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Lỗi {filename}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'--- Hoàn tất! Đã xử lý {count} bài hát. ---'))
