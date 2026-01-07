from django.db.models import Sum, Count
from django.utils.translation import gettext_lazy as _
from .models import Song, Album, Artist
from django.contrib.auth import get_user_model
import datetime
import json  # <--- Nhớ import json

User = get_user_model()


def dashboard_callback(request, context):
    # 1. TÍNH TOÁN KPI (Giữ nguyên)
    total_songs = Song.objects.count()
    total_views = Song.objects.aggregate(Sum('views'))['views__sum'] or 0
    total_comments = Song.objects.aggregate(Count('comments'))['comments__count']

    last_month = datetime.date.today() - datetime.timedelta(days=30)
    new_users = User.objects.filter(date_joined__gte=last_month).count()

    # 2. LẤY DỮ LIỆU TOP BÀI HÁT
    top_views_songs = Song.objects.order_by('-views')[:10]

    top_comments_songs = Song.objects.annotate(cmt_count=Count('comments')).order_by('-cmt_count')[:10]

    # 3. CHUẨN BỊ CONTEXT
    context.update({
        # KPI Cards
        "kpi": [
            {"title": "Tổng bài hát", "metric": total_songs, "footer": "Bài hát trong kho", "color": "primary"},
            {"title": "Tổng lượt nghe", "metric": f"{total_views:,}", "footer": "Toàn hệ thống", "color": "teal"},
            {"title": "Tổng bình luận", "metric": total_comments, "footer": "Tương tác", "color": "amber"},
            {"title": "User mới", "metric": new_users, "footer": "30 ngày qua", "color": "rose"},
        ],

        # Dữ liệu Chart 1: Views (Chuyển thành JSON string)
        "chart_views_data": json.dumps({
            "labels": [s.title for s in top_views_songs],
            "data": [s.views for s in top_views_songs]
        }),

        # Dữ liệu Chart 2: Comments (Chuyển thành JSON string)
        "chart_comments_data": json.dumps({
            "labels": [s.title for s in top_comments_songs],
            "data": [s.cmt_count for s in top_comments_songs]
        }),
    })

    return context