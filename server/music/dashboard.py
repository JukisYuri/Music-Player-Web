from django.db.models import Sum
from django.utils.translation import gettext_lazy as _
from .models import Song, Album, Artist
from django.contrib.auth.models import User
import datetime


def dashboard_callback(request, context):
    # 1. TÍNH TOÁN SỐ LIỆU TỔNG QUAN (KPI)
    total_songs = Song.objects.count()
    total_albums = Album.objects.count()
    total_artists = Artist.objects.count()

    # Tính tổng lượt nghe
    total_views_data = Song.objects.aggregate(Sum('views'))
    total_views = total_views_data['views__sum'] or 0

    # Tính user mới trong 30 ngày qua
    last_month = datetime.date.today() - datetime.timedelta(days=30)
    new_users = User.objects.filter(date_joined__gte=last_month).count()

    # 2. CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ (TOP 5 CA SĨ CÓ NHIỀU BÀI NHẤT)

    top_artists = Artist.objects.all().order_by('-song_count')[:5]

    artist_names = [artist.name for artist in top_artists]
    artist_song_counts = [artist.song_count for artist in top_artists]

    # 3. TRẢ VỀ CONTEXT CHO UNFOLD
    context.update({
        "kpi": [
            {
                "title": "Tổng bài hát",
                "metric": total_songs,
                "footer": "Bài hát trong kho",
                "color": "primary",
            },
            {
                "title": "Tổng lượt nghe",
                "metric": f"{total_views:,}",
                "footer": "Lượt phát toàn hệ thống",
                "color": "teal",
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
                "color": "rose",
            },
        ],

        "chart": {
            "type": "bar",
            "data": {
                "labels": artist_names,
                "datasets": [
                    {
                        "label": "Số lượng bài hát",
                        "data": artist_song_counts,
                        "backgroundColor": "rgba(59, 130, 246, 0.5)",
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