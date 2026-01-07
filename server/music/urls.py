# server/music/urls.py
from django.urls import path
from .views import LocalMusicListView, stream_song, increment_view, TopAlbumsView, AlbumDetailView, SongDetailView, \
    CommentSongView, StatisticsView

urlpatterns = [
    path('local-songs/', LocalMusicListView.as_view(), name='local-songs'),
    path('stream/<int:pk>/', stream_song, name='stream-song'),
    path('view/<int:pk>/', increment_view, name='increment-view'),
    path('top-albums/', TopAlbumsView.as_view(), name='top-albums'),
    path('album/<int:pk>/', AlbumDetailView.as_view(), name='album-detail'),
    path('song/<int:pk>/', SongDetailView.as_view(), name='song-detail'),
    path('song/<int:pk>/comment/', CommentSongView.as_view(), name='post-comment'),
    path('admin/statistics/', StatisticsView.as_view(), name='custom-statistics'),
]