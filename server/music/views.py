import json
import os
import base64

from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse, FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.conf import settings
from .models import Song
from authentication.models import User
from .models import Album, AlbumSong, Comment
from django.db.models import Sum
from django.views.decorators.csrf import csrf_exempt

def stream_song(request, pk):

    # Lấy bài hát hoặc trả về lỗi 404 nếu không thấy
    song = get_object_or_404(Song, pk=pk)
    if not song.audio_file:
        raise Http404("Bài hát này chưa có file audio")
    file_path = song.audio_file.path

    # Kiểm tra file có thực sự tồn tại trên ổ cứng không
    if not os.path.exists(file_path):
        raise Http404("File gốc đã bị xóa khỏi server")

    #(read binary)
    file_handle = open(file_path, 'rb')
    response = FileResponse(file_handle)
    return response


# --- 2. VIEW API LIST NHẠC ---
class LocalMusicListView(View):
    def get(self, request):
        songs = Song.objects.all().prefetch_related('artists').order_by('-views')
        data = []
        for song in songs:
            cover_url = request.build_absolute_uri(song.cover_image.url) if song.cover_image else ""
            audio_url = request.build_absolute_uri(reverse('stream-song', args=[song.id]))

            # Nối tên nghệ sĩ
            artist_str = ", ".join([a.name for a in song.artists.all()])

            m = song.duration // 60
            s = song.duration % 60

            data.append({
                "id": song.id,
                "title": song.title,
                "artist": artist_str,
                "cover": cover_url,
                "audioUrl": audio_url,
                "duration": f"{m}:{s:02d}",
                "views": song.views
            })
        return JsonResponse(data, safe=False)

# Tính View
@csrf_exempt
def increment_view(request, pk):
    if request.method == 'POST':
        try:
            song = Song.objects.get(pk=pk)
            song.views += 1
            song.save()
            return JsonResponse({'status': 'success', 'views': song.views})
        except Song.DoesNotExist:
            return JsonResponse({'status': 'error'}, status=404)
    return JsonResponse({'status': 'error'}, status=405)

# Lấy top album
class TopAlbumsView(View):
    def get(self, request):
        # Lấy top 10 album theo view
        albums = Album.objects.annotate(
            total_views=Sum('songs__views')
        ).order_by('-total_views')[:10].prefetch_related('songs', 'artists')

        data = []
        for album in albums:
            cover_url = ""
            first_song = album.songs.first()

            if first_song and first_song.cover_image:
                cover_url = request.build_absolute_uri(first_song.cover_image.url)
            elif album.cover_image:
                cover_url = request.build_absolute_uri(album.cover_image.url)

            # Nối tên nghệ sĩ Album
            artists_str = ", ".join([a.name for a in album.artists.all()]) or "Various Artists"

            data.append({
                "id": album.id,
                "title": album.title,
                "artist": artists_str,
                "cover": cover_url,
                "total_views": album.total_views or 0
            })

        return JsonResponse(data, safe=False)


class AlbumDetailView(View):
    def get(self, request, pk):
        # 1. Lấy Album theo ID (pk)
        album = get_object_or_404(Album, pk=pk)

        # 2. Lấy các bài hát thuộc album này (sắp xếp theo thứ tự trong AlbumSong nếu cần)
        # Sử dụng related_name='songs' đã định nghĩa trong model Album
        songs = album.songs.all()

        # 3. Chuẩn bị data cho Album Info
        album_cover = ""
        if album.cover_image:
            album_cover = request.build_absolute_uri(album.cover_image.url)

        album_artists = ", ".join([a.name for a in album.artists.all()]) or "Various Artists"

        # 4. Chuẩn bị data danh sách bài hát
        songs_data = []
        for song in songs:
            cover_url = request.build_absolute_uri(song.cover_image.url) if song.cover_image else album_cover
            audio_url = request.build_absolute_uri(reverse('stream-song', args=[song.id]))

            # Artist của bài hát (nếu không có thì lấy artist của album)
            s_artists = ", ".join([a.name for a in song.artists.all()])
            if not s_artists:
                s_artists = album_artists

            m = song.duration // 60
            s = song.duration % 60

            songs_data.append({
                "id": song.id,
                "title": song.title,
                "artist": s_artists,
                "cover": cover_url,
                "audioUrl": audio_url,
                "duration": f"{m}:{s:02d}",
                "views": song.views
            })

        response_data = {
            "info": {
                "id": album.id,
                "title": album.title,
                "artist": album_artists,
                "cover": album_cover,
                "description": album.description,
            },
            "songs": songs_data
        }

        return JsonResponse(response_data)


class SongDetailView(View):
    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)

        # 1. Lấy bài hát liên quan (Giữ nguyên logic cũ)
        artist_ids = song.artists.values_list('id', flat=True)
        related_songs = Song.objects.filter(artists__id__in=artist_ids).exclude(id=pk).distinct()[:5]

        # 2. Lấy danh sách bình luận (MỚI)
        comments = song.comments.select_related('user').order_by('-created_at')
        comments_data = []
        for c in comments:
            comments_data.append({
                "id": c.id,
                "user": c.user.username,
                # Nếu User có avatar thì lấy, không thì để rỗng
                "avatar": "",
                "content": c.content,
                "created_at": c.created_at.strftime("%d/%m/%Y %H:%M")
            })

        # Helper format (Giữ nguyên logic cũ)
        def format_song(s):
            cover_url = request.build_absolute_uri(s.cover_image.url) if s.cover_image else ""
            audio_url = request.build_absolute_uri(reverse('stream-song', args=[s.id]))
            artists = ", ".join([a.name for a in s.artists.all()])
            m = s.duration // 60
            ss = s.duration % 60
            return {
                "id": s.id,
                "title": s.title,
                "artist": artists,
                "cover": cover_url,
                "audioUrl": audio_url,
                "duration": f"{m}:{ss:02d}",
                "views": s.views
            }

        response_data = {
            "info": format_song(song),
            "related": [format_song(s) for s in related_songs],
            "comments": comments_data
        }

        return JsonResponse(response_data)


@method_decorator(csrf_exempt, name='dispatch')
class CommentSongView(View):
    def post(self, request, pk):
        try:
            body = json.loads(request.body)
            content = body.get('content', '').strip()
            user_id = body.get('user_id')  # <--- Lấy ID từ body thay vì request.user

            if not content:
                return JsonResponse({'status': 'error', 'message': 'Nội dung trống'}, status=400)

            if not user_id:
                return JsonResponse({'status': 'error', 'message': 'Thiếu User ID'}, status=400)

            # Tìm bài hát
            song = get_object_or_404(Song, pk=pk)
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'User không tồn tại'}, status=404)

            # Tạo comment
            comment = Comment.objects.create(
                user=user,
                song=song,
                content=content
            )

            return JsonResponse({
                'status': 'success',
                'comment': {
                    "id": comment.id,
                    "user": user.display_name if user.display_name else user.username,
                    "avatar": request.build_absolute_uri(user.profile_image_url.url) if user.profile_image_url else "",
                    "content": comment.content,
                    "created_at": comment.created_at.strftime("%d/%m/%Y %H:%M")
                }
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)