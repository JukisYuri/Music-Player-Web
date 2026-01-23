from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from sentiment.apps import SentimentConfig
from .models import Artist, Album, Song, Playlist, PlaylistSong, AlbumSong, Comment, ListeningHistory


# --- 1. ARTIST ADMIN ---
@admin.register(Artist)
class ArtistAdmin(ModelAdmin):
    list_display = ('name', 'song_count', 'created_at')
    search_fields = ('name',)
    ordering = ('-song_count',)


# --- 2. ALBUM ADMIN ---
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
    inlines = [AlbumSongInline]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(songs_count_annotated=Count('songs'))

    @display(description="Số bài hát", ordering='songs_count_annotated')
    def song_count(self, obj):
        return obj.songs.count()

    @display(description="Nghệ sĩ")
    def get_artists(self, obj):
        return ", ".join([a.name for a in obj.artists.all()])

@admin.action(description='Phân loại lại cảm xúc bằng AI')
def analyze_sentiment_action(modeladmin, request, queryset):
    """Action để chạy AI cho các comment được chọn trong trang Admin"""
    predictor = SentimentConfig.predictor
    updated = []

    for comment in queryset:
        label, conf = predictor.predict(comment.content)
        comment.sentiment = label
        comment.confidence_score = conf
        updated.append(comment)

    Comment.objects.bulk_update(updated, ['sentiment', 'confidence_score'])

    modeladmin.message_user(request, f"Đã phân loại xong {len(updated)} comment!")

# --- 3. COMMENT MANAGEMENT (MỚI - QUẢN LÝ BÌNH LUẬN) ---
@admin.register(Comment)
class CommentAdmin(ModelAdmin):
    list_display = ('user', 'song', 'content_short', 'sentiment_badge', 'confidence_fmt', 'created_at')
    list_filter = ('sentiment', 'created_at', 'song')
    search_fields = ('content', 'user__username', 'song__title')
    autocomplete_fields = ['user', 'song']
    list_per_page = 20
    readonly_fields = ('created_at', 'confidence_score')

    actions = [analyze_sentiment_action]

    @display(description="Nội dung")
    def content_short(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    @display(description="Cảm xúc", ordering='sentiment')
    def sentiment_badge(self, obj):
        if obj.sentiment == 'POSITIVE':
            color = "green"
            label = "Tích cực"
        elif obj.sentiment == 'NEGATIVE':
            color = "red"
            label = "Tiêu cực"
        else:
            color = "gray"
            label = "Trung tính"

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, label
        )

    @display(description="Độ tin cậy", ordering='confidence_score')
    def confidence_fmt(self, obj):
        if obj.confidence_score:
            return f"{obj.confidence_score * 100:.1f}%"
        return "-"


# --- 4. SONG ADMIN (CẬP NHẬT INLINE) ---
class CommentInline(TabularInline):
    model = Comment
    extra = 0
    tab = True
    fields = ('user', 'content', 'sentiment_badge', 'confidence_fmt', 'created_at')
    readonly_fields = ('sentiment_badge', 'confidence_fmt', 'created_at')
    autocomplete_fields = ['user']

    @display(description="Cảm xúc")
    def sentiment_badge(self, obj):
        if obj.sentiment == 'POSITIVE':
            color = "green"
            label = "Tích cực"
        elif obj.sentiment == 'NEGATIVE':
            color = "red"
            label = "Tiêu cực"
        else:
            color = "gray"
            label = "Trung tính"
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, label)

    @display(description="Độ tin cậy")
    def confidence_fmt(self, obj):
        return f"{obj.confidence_score * 100:.1f}%" if obj.confidence_score else "-"


@admin.register(Song)
class SongAdmin(ModelAdmin):
    list_display = ('title_display', 'get_artists', 'get_albums', 'duration_fmt', 'views_badge')
    list_filter = ('artists', 'albums')
    search_fields = ('title', 'artists__name')
    readonly_fields = ('views',)
    list_per_page = 20
    autocomplete_fields = ['artists']
    ordering = ('-views',)
    inlines = [CommentInline]

    @display(description="Tên bài hát", ordering='title')
    def title_display(self, obj):
        return format_html("<b>{}</b>", obj.title)

    @display(description="Nghệ sĩ")
    def get_artists(self, obj):
        return ", ".join([a.name for a in obj.artists.all()])

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


# --- 5. PLAYLIST ADMIN ---
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





