# models.py
from django.conf import settings
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
    title = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='playlists')
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
    SENTIMENT_CHOICES = [
        ('POSITIVE', 'Tích cực'),
        ('NEGATIVE', 'Tiêu cực'),
        ('NEUTRAL', 'Trung tính'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='comments')
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, blank=True, null=True)
    confidence_score = models.FloatField(default=0.0)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.song.title}"

class ListeningHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listening_history')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='played_by')
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Lịch sử nghe"
        verbose_name_plural = "Lịch sử nghe"
        ordering = ['-played_at']

    def __str__(self):
        return f"{self.user.username} nghe {self.song.title} lúc {self.played_at}"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.song.views += 1
            self.song.save()
        super().save(*args, **kwargs)