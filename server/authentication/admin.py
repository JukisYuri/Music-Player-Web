from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from django.contrib.auth import get_user_model
from django.utils.html import format_html

from music.admin import ListeningHistoryInline, CommentInline
from .models import User

User = get_user_model()

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

    inlines = [ListeningHistoryInline, CommentInline]

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
