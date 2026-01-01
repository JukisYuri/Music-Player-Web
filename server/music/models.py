from django.db import models
from django.contrib.auth.models import User


class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='artists/', default='artists/default.jpg')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# 2. Bảng Album
class Album(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    cover_image = models.ImageField(upload_to='albums/', default='albums/default.jpg')
    release_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


# 3. Bảng Bài hát
class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='songs')
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name='songs')

    audio_file = models.FileField(upload_to='songs/')
    cover_image = models.ImageField(upload_to='songs/covers/', blank=True, null=True)
    duration = models.IntegerField(help_text="Thời lượng tính bằng giây", default=0)

    views = models.IntegerField(default=0)
    likes = models.ManyToManyField(User, related_name='liked_songs', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# 4. Bảng Playlist
class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cover_image = models.ImageField(upload_to='playlists/', default='playlists/default.jpg')
    is_public = models.BooleanField(default=True)  # Công khai hoặc Riêng tư
    created_at = models.DateTimeField(auto_now_add=True)

    songs = models.ManyToManyField(Song, through='PlaylistSong', related_name='playlists')

    def __str__(self):
        return f"{self.title} - {self.user.username}"


# 5. Bảng Trung gian Playlist
class PlaylistSong(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']