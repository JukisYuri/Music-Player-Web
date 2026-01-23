from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.db.models import Q
from music.models import Comment
from .apps import MusicConfig


class SyncSentimentView(APIView):
    """
    API này dùng để quét và phân loại lại các comment cũ trong Database.
    Chỉ Admin mới được gọi API này để tránh spam server.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            # 1. Lọc ra các comment chưa có nhãn (sentiment là NULL hoặc rỗng)
            # Hoặc bỏ filter nếu bạn muốn chạy lại toàn bộ DB (cẩn thận nếu dữ liệu lớn)
            comments_to_scan = Comment.objects.filter(Q(sentiment__isnull=True) | Q(sentiment=''))

            if not comments_to_scan.exists():
                return Response({'message': 'Tất cả comment đã được phân loại. Không có dữ liệu cũ.'}, status=200)

            # 2. Lấy Model AI đã load sẵn
            predictor = MusicConfig.predictor
            if not predictor:
                return Response({'error': 'AI Model chưa được load.'}, status=500)

            print(f"--> Bắt đầu phân loại {comments_to_scan.count()} comment cũ...")

            updated_objects = []

            # 3. Vòng lặp xử lý (Chỉ chạy trên RAM, chưa lưu DB ngay)
            for comment in comments_to_scan:
                # Gọi hàm predict từ service
                label, conf = predictor.predict(comment.content)

                # Cập nhật giá trị cho object (chưa save)
                comment.sentiment = label
                comment.confidence_score = conf

                updated_objects.append(comment)

            # 4. Lưu xuống DB 1 lần duy nhất (Tối ưu tốc độ gấp 100 lần so với loop save)
            if updated_objects:
                Comment.objects.bulk_update(updated_objects, ['sentiment', 'confidence_score'])

            return Response({
                'status': 'success',
                'total_scanned': len(updated_objects),
                'message': f'Đã cập nhật phân loại cho {len(updated_objects)} comment cũ.'
            }, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)