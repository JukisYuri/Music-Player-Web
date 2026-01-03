from django.contrib import admin
from django.utils.html import format_html
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