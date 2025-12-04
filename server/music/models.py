from django.db import models


class Song(models.Model):

    youtube_id = models.CharField(max_length=50, unique=True)

    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    duration = models.CharField(max_length=20, blank=True, null=True)
    cover_url = models.URLField(max_length=500, blank=True, null=True)

    # Đếm số lượt nghe (để sau này làm Top Trending)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title