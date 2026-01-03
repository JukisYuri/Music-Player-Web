# server/music/urls.py
from django.urls import path
from .views import LocalMusicListView, stream_song

urlpatterns = [
    # Đường dẫn API mới
    path('local-songs/', LocalMusicListView.as_view(), name='local-songs'),
    path('stream/<int:pk>/', stream_song, name='stream-song'),
]