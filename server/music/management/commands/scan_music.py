import os
from django.core.management.base import BaseCommand
from django.conf import settings
from music.models import Song, Artist, Album
from mutagen.mp3 import MP3
from mutagen.id3 import ID3


class Command(BaseCommand):
    help = 'Quét file nhạc từ thư mục data/mp3 và ảnh từ data/image để lưu vào Database'

    def handle(self, *args, **kwargs):
        # CẤU HÌNH TÊN THƯ MỤC
        MP3_FOLDER_NAME = 'mp3'
        IMG_FOLDER_NAME = 'images'  # Bạn có thể đổi thành 'img' nếu folder tên là img

        music_dir = os.path.join(settings.MEDIA_ROOT, MP3_FOLDER_NAME)
        image_dir = os.path.join(settings.MEDIA_ROOT, IMG_FOLDER_NAME)

        # Kiểm tra thư mục nhạc
        if not os.path.exists(music_dir):
            self.stdout.write(self.style.ERROR(f'Không tìm thấy thư mục nhạc: {music_dir}'))
            return

        # Kiểm tra thư mục ảnh (để báo warning nếu không có)
        has_img_dir = os.path.exists(image_dir)
        if not has_img_dir:
            self.stdout.write(
                self.style.WARNING(f'Cảnh báo: Không tìm thấy thư mục ảnh: {image_dir}. Sẽ không quét cover.'))

        files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
        self.stdout.write(f'Tìm thấy {len(files)} file nhạc. Đang xử lý...')

        count = 0
        updated_covers = 0

        for filename in files:
            file_path = os.path.join(music_dir, filename)

            # --- XỬ LÝ 1: METADATA & AUDIO ---
            try:
                try:
                    tags = ID3(file_path)
                    audio = MP3(file_path)
                    # Lấy tag hoặc fallback về tên file
                    title = str(tags.get('TIT2')) if tags.get('TIT2') else filename.replace('.mp3', '')
                    artist_name = str(tags.get('TPE1')) if tags.get('TPE1') else "Unknown Artist"
                    album_name = str(tags.get('TALB')) if tags.get('TALB') else f"Tuyển tập {artist_name}"
                    duration = int(audio.info.length)
                except Exception:
                    title = filename.replace('.mp3', '')
                    artist_name = "Unknown Artist"
                    album_name = "Unknown Album"
                    duration = 0

                # --- XỬ LÝ 2: TÌM ẢNH COVER TƯƠNG ỨNG ---
                cover_rel_path = None
                if has_img_dir:
                    base_name = os.path.splitext(filename)[0]  # Tên file không đuôi (VD: 'Em Cua Ngay Hom Qua')
                    # Các đuôi ảnh phổ biến cần check
                    for ext in ['.jpg', '.jpeg', '.png', '.webp']:
                        img_name = f"{base_name}{ext}"
                        if os.path.exists(os.path.join(image_dir, img_name)):
                            # Lưu đường dẫn tương đối (VD: 'image/Em Cua Ngay Hom Qua.jpg')
                            cover_rel_path = os.path.join(IMG_FOLDER_NAME, img_name)
                            break

                # --- XỬ LÝ 3: LƯU VÀO DB ---
                artist_obj, _ = Artist.objects.get_or_create(name=artist_name)
                album_obj, _ = Album.objects.get_or_create(title=album_name, artist=artist_obj)

                relative_audio_path = os.path.join(MP3_FOLDER_NAME, filename)

                # Chuẩn bị dữ liệu để update/create
                update_values = {
                    'album': album_obj,
                    'audio_file': relative_audio_path,
                    'duration': duration
                }

                # Chỉ cập nhật cover nếu tìm thấy ảnh mới
                if cover_rel_path:
                    update_values['cover_image'] = cover_rel_path
                    updated_covers += 1

                obj, created = Song.objects.update_or_create(
                    title=title,
                    artist=artist_obj,
                    defaults=update_values
                )

                action = "Thêm mới" if created else "Cập nhật"
                cover_msg = f"| Cover: {cover_rel_path}" if cover_rel_path else ""
                self.stdout.write(f'- {action}: {title} {cover_msg}')
                count += 1

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Lỗi {filename}: {e}'))

        self.stdout.write(
            self.style.SUCCESS(f'--- Hoàn tất! Xử lý {count} bài, tìm thấy {updated_covers} ảnh cover. ---'))