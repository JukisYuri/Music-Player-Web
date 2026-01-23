from django.urls import path
from .views import  SyncSentimentView  # <--- Import view mới

urlpatterns = [
    # URL MỚI: Gọi vào đây để update dữ liệu cũ
    path('comments/sync-sentiment/', SyncSentimentView.as_view(), name='sync_sentiment'),
]