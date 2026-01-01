from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import Artist, Album, Song, Playlist, PlaylistSong


# 1. Quản lý Ca sĩ
@admin.register(Artist)
class ArtistAdmin(ModelAdmin):
    list_display = ('name', 'album_count', 'created_at')
    search_fields = ('name',)

    # Hiển thị số lượng album của ca sĩ
    @display(description="Số Album")
    def album_count(self, obj):
        return obj.albums.count()


# 2. Quản lý Album
@admin.register(Album)
class AlbumAdmin(ModelAdmin):
    list_display = ('title', 'artist', 'release_date', 'song_count')
    list_filter = ('artist',)
    search_fields = ('title', 'artist__name')

    @display(description="Số bài hát")
    def song_count(self, obj):
        return obj.songs.count()


# 3. Quản lý Bài hát
@admin.register(Song)
class SongAdmin(ModelAdmin):
    list_display = ('title_display', 'artist', 'album', 'duration_fmt', 'views_badge')
    list_filter = ('artist', 'album')
    search_fields = ('title', 'artist__name')
    readonly_fields = ('views',)
    list_per_page = 20

    # Hiển thị tên bài hát in đậm
    def title_display(self, obj):
        return format_html("<b>{}</b>", obj.title)

    title_display.short_description = "Tên bài hát"

    # Hiển thị lượt nghe dạng Badge (Nhãn)
    @display(description="Lượt nghe", label=True)
    def views_badge(self, obj):
        return obj.views

    # Format thời gian
    @display(description="Thời lượng")
    def duration_fmt(self, obj):
        if not obj.duration: return "0:00"
        m = obj.duration // 60
        s = obj.duration % 60
        return f"{m}:{s:02d}"


# 4. Quản lý Playlist (Dùng TabularInline của Unfold)
class PlaylistSongInline(TabularInline):
    model = PlaylistSong
    extra = 1
    tab = True  # Giao diện Tab đẹp hơn


@admin.register(Playlist)
class PlaylistAdmin(ModelAdmin):
    list_display = ('title', 'user', 'is_public_badge', 'song_count')
    search_fields = ('title', 'user__username')
    inlines = [PlaylistSongInline]

    @display(description="Số lượng bài")
    def song_count(self, obj):
        return obj.songs.count()

    @display(description="Trạng thái", boolean=True)
    def is_public_badge(self, obj):
        return obj.is_public