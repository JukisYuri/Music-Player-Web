# admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
# Import thêm AlbumSong
from .models import Artist, Album, Song, Playlist, PlaylistSong, AlbumSong


# 1. ARTIST ADMIN (Giữ nguyên)
@admin.register(Artist)
class ArtistAdmin(ModelAdmin):
    list_display = ('name', 'song_count', 'created_at')
    search_fields = ('name',)
    ordering = ('-song_count',)


# 2. ALBUM ADMIN (Sửa đổi)

# Tạo Inline mới dùng bảng trung gian
class AlbumSongInline(TabularInline):
    model = AlbumSong
    extra = 1
    tab = True

    autocomplete_fields = ['song']
    exclude = ('order',)


@admin.register(Album)
class AlbumAdmin(ModelAdmin):
    list_display = ('title', 'get_artists', 'release_date', 'song_count')
    list_filter = ('artists',)
    search_fields = ('title', 'artists__name')
    autocomplete_fields = ['artists']

    # Thay SongInline cũ bằng AlbumSongInline
    inlines = [AlbumSongInline]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        # Sửa lại annotate vì quan hệ M2M vẫn dùng 'songs' nhưng logic hơi khác một chút
        return queryset.annotate(songs_count_annotated=Count('songs'))

    @display(description="Số bài hát", ordering='songs_count_annotated')
    def song_count(self, obj):
        return obj.songs.count()

    @display(description="Nghệ sĩ")
    def get_artists(self, obj):
        return ", ".join([a.name for a in obj.artists.all()])


# 3. SONG ADMIN (Sửa đổi)
@admin.register(Song)
class SongAdmin(ModelAdmin):
    # Bỏ 'album' khỏi list_display vì Song không còn field album trực tiếp (nó là M2M)
    list_display = ('title_display', 'get_artists', 'get_albums', 'duration_fmt', 'views_badge')
    list_filter = ('artists', 'albums')  # Lọc theo albums
    search_fields = ('title', 'artists__name')  # Bắt buộc phải có để autocomplete hoạt động bên Album
    readonly_fields = ('views',)
    list_per_page = 20

    # Bỏ 'album' khỏi autocomplete vì không còn field đó
    autocomplete_fields = ['artists']

    @display(description="Tên bài hát", ordering='title')
    def title_display(self, obj):
        return format_html("<b>{}</b>", obj.title)

    @display(description="Nghệ sĩ")
    def get_artists(self, obj):
        return ", ".join([a.name for a in obj.artists.all()])

    # Thêm hiển thị Album (vì 1 bài có thể thuộc nhiều album hoặc không thuộc album nào)
    @display(description="Album")
    def get_albums(self, obj):
        return ", ".join([a.title for a in obj.albums.all()])

    @display(description="Lượt nghe", label=True, ordering='views')
    def views_badge(self, obj):
        return obj.views

    @display(description="Thời lượng", ordering='duration')
    def duration_fmt(self, obj):
        if not obj.duration: return "0:00"
        m = obj.duration // 60
        s = obj.duration % 60
        return f"{m}:{s:02d}"


# 4. PLAYLIST ADMIN (Giữ nguyên)
class PlaylistSongInline(TabularInline):
    model = PlaylistSong
    extra = 1
    tab = True
    autocomplete_fields = ['song']
    exclude = ('order',)


@admin.register(Playlist)
class PlaylistAdmin(ModelAdmin):
    list_display = ('title', 'user', 'is_public_badge', 'song_count')
    search_fields = ('title', 'user__username')
    autocomplete_fields = ['user']
    inlines = [PlaylistSongInline]


    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(songs_count_annotated=Count('songs'))

    @display(description="Số lượng bài", ordering='songs_count_annotated')
    def song_count(self, obj):
        return obj.songs.count()

    @display(description="Trạng thái", boolean=True, ordering='is_public')
    def is_public_badge(self, obj):
        return obj.is_public