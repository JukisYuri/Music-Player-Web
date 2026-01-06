# server/music/urls.py
from django.urls import path
from .views import LocalMusicListView, stream_song, increment_view, TopAlbumsView

urlpatterns = [
    path('local-songs/', LocalMusicListView.as_view(), name='local-songs'),
    path('stream/<int:pk>/', stream_song, name='stream-song'),
    path('view/<int:pk>/', increment_view, name='increment-view'),
    path('top-albums/', TopAlbumsView.as_view(), name='top-albums'),
]