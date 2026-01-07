import os
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from music.models import Song, Album


class Command(BaseCommand):
    help = 'Quét JSON để gom bài hát có sẵn vào Album (Không tạo bài mới)'

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str, help='Tên file JSON trong thư mục data/')

    def handle(self, *args, **options):
        filename = options['filename']

        # 1. Đường dẫn file
        base_dir = settings.BASE_DIR
        json_file_path = os.path.join(base_dir, 'data', filename)

        if not os.path.exists(json_file_path):
            self.stdout.write(self.style.ERROR(f'❌ Không tìm thấy file: {json_file_path}'))
            return

        # 2. Tạo/Lấy Album từ tên file (Ví dụ: "Sơn Tùng.json" -> Album "Sơn Tùng")
        album_title = Path(filename).stem
        album, created = Album.objects.get_or_create(title=album_title)

        if created:
            self.stdout.write(self.style.SUCCESS(f'📂 Đã tạo Album mới: "{album_title}"'))
        else:
            self.stdout.write(f'📂 Album "{album_title}" đã tồn tại. Đang cập nhật danh sách bài hát...')

        # 3. Đọc JSON
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR('❌ Lỗi format JSON'))
            return

        # 4. Duyệt và Gắn bài hát
        count_linked = 0
        count_missing = 0

        self.stdout.write(f"🔍 Bắt đầu quét {len(data)} mục trong JSON...")

        for item in data:
            # --- Xử lý tên bài hát ---
            # JSON: "Chúng Ta Của Hiện Tại - Sơn Tùng M-TP"
            raw_name = item.get('song_name', '')
            if not raw_name:
                continue

            # Tách tên bài: Lấy phần trước dấu " - " cuối cùng
            if ' - ' in raw_name:
                song_title = raw_name.rsplit(' - ', 1)[0].strip()
            else:
                song_title = raw_name.strip()

            # --- Tìm trong Database ---
            # Dùng iexact (không phân biệt hoa thường) để tìm chính xác tên
            # Hoặc dùng icontains nếu bạn sợ tên trong DB hơi khác
            song = Song.objects.filter(title__iexact=song_title).first()

            if song:
                # Nếu tìm thấy -> Gắn vào Album
                # Kiểm tra xem đã gắn chưa để tránh log thừa
                if album in song.albums.all():
                    self.stdout.write(f"   ℹ️  {song_title}: Đã có trong album rồi.")
                else:
                    song.albums.add(album)
                    song.save()
                    self.stdout.write(self.style.SUCCESS(f"   ✅ Đã thêm: {song_title}"))
                    count_linked += 1
            else:
                # Nếu không thấy trong DB -> Bỏ qua
                self.stdout.write(
                    self.style.WARNING(f"   🚫 Không tìm thấy bài: '{song_title}' trong Database (Bỏ qua)"))
                count_missing += 1

        # Tổng kết
        self.stdout.write("\n------------------------------------------------")
        self.stdout.write(f"Kết quả cho Album '{album_title}':")
        self.stdout.write(self.style.SUCCESS(f" - Đã thêm vào album: {count_linked} bài"))
        self.stdout.write(self.style.WARNING(f" - Không tìm thấy trong DB: {count_missing} bài"))