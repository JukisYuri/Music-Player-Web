# server/music/urls.py
from django.urls import path
from .views import LocalMusicListView, stream_song, increment_view, TopAlbumsView, AlbumDetailView, SongDetailView, \
    CommentSongView, StatisticsView, MyPlaylistListView, AddSongToPlaylistView, PlaylistDetailView, ArtistAlbumsView, \
    ArtistDetailView, RecordPlaybackView, ListeningHistoryListView

urlpatterns = [
    path('local-songs/', LocalMusicListView.as_view(), name='local-songs'),
    path('stream/<int:pk>/', stream_song, name='stream-song'),
    path('view/<int:pk>/', increment_view, name='increment-view'),

    path('top-albums/', TopAlbumsView.as_view(), name='top-albums'),
    path('artist-albums/', ArtistAlbumsView.as_view(), name='artist-albums'),

    path('artist/<int:pk>/', ArtistDetailView.as_view(), name='artist-detail'),
    path('album/<int:pk>/', AlbumDetailView.as_view(), name='album-detail'),

    path('song/<int:pk>/', SongDetailView.as_view(), name='song-detail'),
    path('song/<int:pk>/comment/', CommentSongView.as_view(), name='post-comment'),

    path('admin/statistics/', StatisticsView.as_view(), name='custom-statistics'),

    path('my-playlists/', MyPlaylistListView.as_view(), name='my-playlists'),
    path('playlist/<int:playlist_id>/add-song/<int:song_id>/', AddSongToPlaylistView.as_view(), name='add-song-to-playlist'),
    path('playlist/<int:pk>/', PlaylistDetailView.as_view(), name='playlist-detail'),

    path('record-playback/<int:song_id>/', RecordPlaybackView.as_view(), name='record-playback'),
    path('history/', ListeningHistoryListView.as_view(), name='listening-history'),


]