from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import Artist, Album, Song, Playlist, PlaylistSong
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from django.utils.html import format_html
from .models import User

class UserAdmin(BaseUserAdmin, ModelAdmin):
    # Liệt kê các cột muốn hiện ra bảng
    list_display = ['username', 'display_name', 'email', 'avatar_preview', 'is_active', 'is_staff']
    
    # Cho phép tìm theo hiển thị
    search_fields = ['username', 'email', 'display_name']
    
    # Lọc theo quyền hạn hoặc trạng thái hoạt động
    list_filter = ['is_staff', 'is_active', 'groups']

    # Thêm các trường mới (display_name, description...) vào form sửa
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Thông tin bổ sung (Music App)', {
            'fields': ('display_name', 'description', 'profile_image_url')
        }),
    )

    # Hiển thị ảnh đại diện dưới dạng hình thu nhỏ trong bảng
    def avatar_preview(self, obj):
        if obj.profile_image_url:
            return format_html(
                '<img src="{}" style="width: 35px; height: 35px; object-fit: cover; border-radius: 50%; border: 1px solid #ccc;" />',
                obj.profile_image_url.url
            )
        return "No Image"
    avatar_preview.short_description = "Avatar"

admin.site.register(User, UserAdmin)

@admin.register(Artist)
class ArtistAdmin(ModelAdmin):
    list_display = ('name', 'song_count', 'created_at')
    search_fields = ('name',)
    ordering = ('-song_count',)


@admin.register(Album)
class AlbumAdmin(ModelAdmin):
    list_display = ('title', 'get_artists', 'release_date', 'song_count')
    list_filter = ('artists',)
    search_fields = ('title', 'artists__name')

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(songs_count_annotated=Count('songs'))

    @display(description="Số bài hát", ordering='songs_count_annotated')
    def song_count(self, obj):
        return obj.songs.count()

    @display(description="Nghệ sĩ")
    def get_artists(self, obj):
        return ", ".join([a.name for a in obj.artists.all()])


@admin.register(Song)
class SongAdmin(ModelAdmin):
    list_display = ('title_display', 'get_artists', 'album', 'duration_fmt', 'views_badge')
    list_filter = ('artists', 'album')
    search_fields = ('title', 'artists__name')
    readonly_fields = ('views',)
    list_per_page = 20

    @display(description="Tên bài hát", ordering='title')
    def title_display(self, obj):
        return format_html("<b>{}</b>", obj.title)

    @display(description="Nghệ sĩ")
    def get_artists(self, obj):
        return ", ".join([a.name for a in obj.artists.all()])

    @display(description="Lượt nghe", label=True, ordering='views')
    def views_badge(self, obj):
        return obj.views

    @display(description="Thời lượng", ordering='duration')
    def duration_fmt(self, obj):
        if not obj.duration: return "0:00"
        m = obj.duration // 60
        s = obj.duration % 60
        return f"{m}:{s:02d}"


class PlaylistSongInline(TabularInline):
    model = PlaylistSong
    extra = 1
    tab = True


@admin.register(Playlist)
class PlaylistAdmin(ModelAdmin):
    list_display = ('title', 'user', 'is_public_badge', 'song_count')
    search_fields = ('title', 'user__username')
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