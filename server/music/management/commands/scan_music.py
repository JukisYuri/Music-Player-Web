import os
from django.core.management.base import BaseCommand
from django.conf import settings
from music.models import Song, Artist, Album
from mutagen.mp3 import MP3
from mutagen.id3 import ID3


class Command(BaseCommand):
    help = 'Quét nhạc hỗ trợ nhiều ca sĩ (ngăn cách bởi dấu phẩy)'

    def handle(self, *args, **kwargs):
        MP3_FOLDER = 'mp3'
        IMG_FOLDER = 'images'
        music_dir = os.path.join(settings.MEDIA_ROOT, MP3_FOLDER)
        image_dir = os.path.join(settings.MEDIA_ROOT, IMG_FOLDER)

        if not os.path.exists(music_dir):
            return

        files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
        self.stdout.write(f'Tìm thấy {len(files)} file nhạc...')

        for filename in files:
            file_path = os.path.join(music_dir, filename)
            try:
                # 1. Đọc Metadata
                try:
                    tags = ID3(file_path)
                    audio = MP3(file_path)
                    title = str(tags.get('TIT2')) if tags.get('TIT2') else filename.replace('.mp3', '')

                    # Lấy chuỗi raw artist (VD: "Artist A, Artist B")
                    artist_raw = str(tags.get('TPE1')) if tags.get('TPE1') else "Unknown Artist"

                    album_name = str(tags.get('TALB')) if tags.get('TALB') else None
                    duration = int(audio.info.length)
                except:
                    title = filename.replace('.mp3', '')
                    artist_raw = "Unknown Artist"
                    album_name = "Unknown Album"
                    duration = 0

                # 2. Xử lý Đa Nghệ sĩ (Split dấu phẩy)
                artist_names = [name.strip() for name in artist_raw.split(',')]

                # Tạo danh sách object Artist
                artist_objs = []
                for name in artist_names:
                    a_obj, _ = Artist.objects.get_or_create(name=name)
                    artist_objs.append(a_obj)

                # 3. Xử lý Album
                if not album_name:
                    # Lấy tên nghệ sĩ đầu tiên làm tên Album tuyển tập
                    album_name = f"Tuyển tập {artist_names[0]}"
                album_obj, _ = Album.objects.get_or_create(title=album_name)

                album_obj.artists.add(*artist_objs)
                # ---------------------

                # 4. Tìm ảnh cover
                cover_rel_path = None
                base_name = os.path.splitext(filename)[0]
                for ext in ['.jpg', '.jpeg', '.png']:
                    if os.path.exists(os.path.join(image_dir, f"{base_name}{ext}")):
                        cover_rel_path = os.path.join(IMG_FOLDER, f"{base_name}{ext}")
                        break

                # 5. Lưu Bài Hát
                song_obj, created = Song.objects.update_or_create(
                    title=title,
                    defaults={
                        'album': album_obj,
                        'audio_file': os.path.join(MP3_FOLDER, filename),
                        'duration': duration,
                        'cover_image': cover_rel_path
                    }
                )

                # Gán danh sách Nghệ sĩ vào bài hát (M2M)
                song_obj.artists.set(artist_objs)

                self.stdout.write(f'- {title} | Artists: {artist_names}')

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Err {filename}: {e}'))

        # --- CẬP NHẬT TRƯỜNG song_count CHO TẤT CẢ NGHỆ SĨ ---
        self.stdout.write("Đang cập nhật số lượng bài hát cho từng nghệ sĩ...")
        for art in Artist.objects.all():
            count = art.songs.count()
            art.song_count = count
            art.save()

        self.stdout.write(self.style.SUCCESS('--- HOÀN TẤT ---'))