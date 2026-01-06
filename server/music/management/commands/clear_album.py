from django.core.management.base import BaseCommand
from music.models import Album


class Command(BaseCommand):
    help = 'Xóa toàn bộ Album trong database (Giữ nguyên Bài hát và Ca sĩ)'

    def handle(self, *args, **kwargs):
        count = Album.objects.count()

        if count == 0:
            self.stdout.write(self.style.WARNING('Không có Album nào để xóa.'))
            return

        self.stdout.write(f'Đang tìm thấy {count} Album...')
        confirm = input(f"Bạn có chắc muốn xóa {count} Album không? (y/n): ")

        if confirm.lower() == 'y':
            Album.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'Đã xóa thành công {count} Album.'))
            self.stdout.write(self.style.SUCCESS('Các bài hát cũ giờ đã trở thành bài hát tự do (không thuộc album).'))
        else:
            self.stdout.write(self.style.WARNING('Đã hủy thao tác.'))