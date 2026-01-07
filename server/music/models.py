# models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='artists/', default='artists/default.jpg')
    created_at = models.DateTimeField(auto_now_add=True)
    song_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name


# --- Thay đổi chính ở đây ---

class Song(models.Model):
    title = models.CharField(max_length=255)
    artists = models.ManyToManyField(Artist, related_name='songs', blank=True)

    audio_file = models.FileField(upload_to='songs/')
    cover_image = models.ImageField(upload_to='image/', blank=True, null=True)
    duration = models.IntegerField(default=0)
    views = models.IntegerField(default=0)
    likes = models.ManyToManyField(User, related_name='liked_songs', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Album(models.Model):
    title = models.CharField(max_length=255)

    songs = models.ManyToManyField(Song, through='AlbumSong', related_name='albums', blank=True)

    artists = models.ManyToManyField(Artist, related_name='albums', blank=True)
    cover_image = models.ImageField(upload_to='albums/', default='albums/default.jpg')
    release_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


class AlbumSong(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return ""


class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cover_image = models.ImageField(upload_to='playlists/', default='playlists/default.jpg')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    songs = models.ManyToManyField(Song, through='PlaylistSong', related_name='playlists')

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class PlaylistSong(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return ""

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.song.title}"