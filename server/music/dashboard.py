from django.db.models import Sum, Count
from django.utils.translation import gettext_lazy as _
from .models import Song, Album, Artist, Playlist
from django.contrib.auth import get_user_model
import datetime

User = get_user_model()
def dashboard_callback(request, context):
    # 1. TÍNH TOÁN SỐ LIỆU TỔNG QUAN (KPI)
    total_songs = Song.objects.count()
    total_albums = Album.objects.count()
    total_artists = Artist.objects.count()

    # Tính tổng lượt nghe (nếu field views là null thì coi là 0)
    total_views_data = Song.objects.aggregate(Sum('views'))
    total_views = total_views_data['views__sum'] or 0

    # Tính user mới trong 30 ngày qua (Ví dụ về logic phức tạp hơn)
    last_month = datetime.date.today() - datetime.timedelta(days=30)
    new_users = User.objects.filter(date_joined__gte=last_month).count()

    # 2. CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ (TOP 5 CA SĨ CÓ NHIỀU BÀI NHẤT)
    # Lấy top 5 ca sĩ, đếm số bài hát của họ
    top_artists = Artist.objects.annotate(song_count=Count('songs')).order_by('-song_count')[:5]

    artist_names = [artist.name for artist in top_artists]
    artist_song_counts = [artist.song_count for artist in top_artists]

    # 3. TRẢ VỀ CONTEXT CHO UNFOLD
    context.update({
        # --- PHẦN THẺ KPI (Hàng trên cùng) ---
        "kpi": [
            {
                "title": "Tổng bài hát",
                "metric": total_songs,
                "footer": "Bài hát trong kho",
                "color": "primary",  # Màu xanh
            },
            {
                "title": "Tổng lượt nghe",
                "metric": f"{total_views:,}",  # Format số có dấu phẩy: 1,000
                "footer": "Lượt phát toàn hệ thống",
                "color": "teal",  # Màu xanh ngọc
            },
            {
                "title": "Ca sĩ & Album",
                "metric": f"{total_artists} / {total_albums}",
                "footer": "Nghệ sĩ / Album",
                "color": "cyan",
            },
            {
                "title": "Người dùng mới",
                "metric": new_users,
                "footer": "Trong 30 ngày qua",
                "color": "rose",  # Màu hồng
            },
        ],

        # --- PHẦN BIỂU ĐỒ (Chart.js) ---
        # Unfold hỗ trợ sẵn Chart.js, ta chỉ cần truyền config JSON
        "chart": {
            "type": "bar",  # Loại biểu đồ: bar, line, pie, doughnut
            "data": {
                "labels": artist_names,
                "datasets": [
                    {
                        "label": "Số lượng bài hát",
                        "data": artist_song_counts,
                        "backgroundColor": "rgba(59, 130, 246, 0.5)",  # Màu cột
                        "borderColor": "rgb(59, 130, 246)",
                        "borderWidth": 1,
                    }
                ]
            },
            "options": {
                "responsive": True,
                "plugins": {
                    "legend": {"position": "top"},
                    "title": {"display": True, "text": "Top 5 Ca sĩ năng suất nhất"}
                },
                "scales": {
                    "y": {"beginAtZero": True}
                }
            }
        },
    })

    return context