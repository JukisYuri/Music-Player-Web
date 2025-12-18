# server/music/urls.py
from django.urls import path
from .views import LocalMusicListView

urlpatterns = [
    # Đường dẫn API mới
    path('local-songs/', LocalMusicListView.as_view(), name='local-songs'),
]