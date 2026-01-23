from django.db.models import Sum, Count, Q
from django.utils.translation import gettext_lazy as _
from .models import Song, Album, Artist
from django.contrib.auth import get_user_model
import datetime
import json

User = get_user_model()


def dashboard_callback(request, context):
    # 1. TÍNH TOÁN KPI
    total_songs = Song.objects.count()
    total_views = Song.objects.aggregate(Sum('views'))['views__sum'] or 0
    total_comments = Song.objects.aggregate(Count('comments'))['comments__count']

    last_month = datetime.date.today() - datetime.timedelta(days=30)
    new_users = User.objects.filter(date_joined__gte=last_month).count()

    # 2. DATA BIỂU ĐỒ 1: TOP VIEWS
    top_views_songs = Song.objects.order_by('-views')[:15]

    # 3. DATA BIỂU ĐỒ 2: SENTIMENT (MỚI - QUAN TRỌNG)
    # Lấy top 15 bài có nhiều comment nhất, sau đó phân loại Positive/Negative/Neutral
    top_sentiment_songs = Song.objects.annotate(
        total_cmt=Count('comments'),
        pos=Count('comments', filter=Q(comments__sentiment='POSITIVE')),
        neg=Count('comments', filter=Q(comments__sentiment='NEGATIVE')),
        neu=Count('comments', filter=Q(comments__sentiment='NEUTRAL'))
    ).order_by('-total_cmt')[:15]

    # 4. CHUẨN BỊ CONTEXT
    context.update({
        "kpi": [
            {"title": "Tổng bài hát", "metric": total_songs, "footer": "Bài hát trong kho", "color": "primary"},
            {"title": "Tổng lượt nghe", "metric": f"{total_views:,}", "footer": "Toàn hệ thống", "color": "teal"},
            {"title": "Tổng bình luận", "metric": total_comments, "footer": "Tương tác", "color": "amber"},
            {"title": "User mới", "metric": new_users, "footer": "30 ngày qua", "color": "rose"},
        ],

        # Chart 1 Data
        "chart_views_data": json.dumps({
            "labels": [s.title for s in top_views_songs],
            "data": [s.views for s in top_views_songs]
        }),

        # Chart 2 Data (Sentiment Stacked)
        "chart_sentiment_data": json.dumps({
            "labels": [s.title for s in top_sentiment_songs],
            "pos": [s.pos for s in top_sentiment_songs],
            "neg": [s.neg for s in top_sentiment_songs],
            "neu": [s.neu for s in top_sentiment_songs],
        }),
    })

    return context