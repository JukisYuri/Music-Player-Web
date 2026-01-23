import json
import os
import random
from django.db.models import Max, Count
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse, FileResponse, Http404
from django.urls import reverse
from django.views.generic import TemplateView
from rest_framework.permissions import IsAuthenticated

from authentication.models import User
from .models import Album, AlbumSong, Comment, Artist, ListeningHistory, Genre
from django.db.models import Sum, Count
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Playlist, Song, PlaylistSong
from .serializers import PlaylistSerializer, CreatePlaylistSerializer, PlaylistDetailSerializer, HistorySerializer


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
            # song.views += random.randint(1, 100)
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
        ).order_by('-total_views')[:5].prefetch_related('songs', 'artists')

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

class ArtistAlbumsView(View):
    def get(self, request):
        artists = Artist.objects.filter(songs__isnull=False).distinct().order_by('?')[:5]

        data = []
        for artist in artists:
            cover_url = ""
            if artist.avatar and "default" not in artist.avatar.url:
                cover_url = request.build_absolute_uri(artist.avatar.url)
            else:
                # Nếu không có avatar thì lấy ảnh bài hát đầu tiên
                first_song = artist.songs.first()
                if first_song and first_song.cover_image:
                    cover_url = request.build_absolute_uri(first_song.cover_image.url)

            # Đếm số bài hát
            song_count = artist.songs.count()

            data.append({
                "id": artist.id,
                "title": artist.name,
                "artist": f"{song_count} bài hát",
                "cover": cover_url,
                "is_artist": True
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


@method_decorator(staff_member_required, name='dispatch')
class StatisticsView(TemplateView):
    template_name = 'admin/statistics.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        top_songs = Song.objects.annotate(
            comment_count=Count('comments')
        ).order_by('-views')[:10]


        chart_data = {
            "labels": [s.title for s in top_songs],
            "views": [s.views for s in top_songs],
            "comments": [s.comment_count for s in top_songs]
        }

        context['chart_data'] = json.dumps(chart_data)
        context['title'] = "Thống kê chi tiết"

        return context

# 1. API Lấy danh sách Playlist & Tạo mới (DÙNG USER ID)
class MyPlaylistListView(generics.ListCreateAPIView):
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Playlist.objects.filter(user_id=user_id).order_by('-created_at')
        return Playlist.objects.none()

    def create(self, request, *args, **kwargs):
        # Lấy user_id từ body gửi lên
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"message": "Thiếu user_id"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(pk=user_id)
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"message": "User không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreatePlaylistSerializer
        return PlaylistSerializer


# 2. API Thêm bài hát vào Playlist (DÙNG USER ID)
class AddSongToPlaylistView(APIView):

    def post(self, request, playlist_id, song_id):
        user_id = request.data.get('user_id')  # Lấy ID từ body

        if not user_id:
            return Response({"message": "Thiếu user_id"}, status=status.HTTP_400_BAD_REQUEST)

        playlist = get_object_or_404(Playlist, id=playlist_id, user_id=user_id)
        song = get_object_or_404(Song, id=song_id)

        if PlaylistSong.objects.filter(playlist=playlist, song=song).exists():
            return Response({"message": "Bài hát này đã có trong playlist"}, status=status.HTTP_400_BAD_REQUEST)

        PlaylistSong.objects.create(playlist=playlist, song=song)
        return Response({"message": "Đã thêm thành công", "status": "success"}, status=status.HTTP_200_OK)


class PlaylistDetailView(generics.RetrieveAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistDetailSerializer
    permission_classes = []
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if not instance.is_public:
            request_user_id = request.query_params.get('user_id')

            if str(instance.user.id) != str(request_user_id):
                return Response(
                    {"detail": "Đây là playlist riêng tư. Bạn không có quyền truy cập."},
                    status=403
                )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ArtistDetailView(View):
    def get(self, request, pk):
        # Lấy nghệ sĩ theo ID
        artist = get_object_or_404(Artist, pk=pk)

        # Lấy tất cả bài hát của nghệ sĩ này
        songs = artist.songs.all().order_by('-created_at')  # Sắp xếp bài mới nhất

        # Chuẩn bị thông tin Header (giả lập cấu trúc giống Playlist/Album để tái sử dụng UI)
        cover_url = ""
        if artist.avatar and "default" not in artist.avatar.url:
            cover_url = request.build_absolute_uri(artist.avatar.url)
        elif songs.exists() and songs.first().cover_image:
            cover_url = request.build_absolute_uri(songs.first().cover_image.url)

        # Danh sách bài hát
        songs_data = []
        for song in songs:
            # Helper tạo URL ảnh/audio
            s_cover = request.build_absolute_uri(song.cover_image.url) if song.cover_image else ""
            s_audio = request.build_absolute_uri(reverse('stream-song', args=[song.id]))

            # Lấy tên các nghệ sĩ thể hiện bài này
            s_artists = ", ".join([a.name for a in song.artists.all()])

            m = song.duration // 60
            s = song.duration % 60

            songs_data.append({
                "id": song.id,
                "title": song.title,
                "artist": s_artists,
                "cover": s_cover,  # Key chuẩn cho Frontend
                "audioUrl": s_audio,  # Key chuẩn cho Frontend
                "duration": f"{m}:{s:02d}",
                "views": song.views
            })

        response_data = {
            "id": artist.id,
            "title": artist.name,  # Tên Playlist = Tên Nghệ sĩ
            "cover_image": cover_url,  # Ảnh bìa
            "user_name": "Nghệ sĩ",  # Người tạo
            "is_public": True,
            "songs": songs_data  # Danh sách bài hát
        }

        return JsonResponse(response_data)


# server/music/views.py

# --- API GHI LẠI LỊCH SỬ KHI NGHE ---
@method_decorator(csrf_exempt, name='dispatch')
# server/music/views.py

@method_decorator(csrf_exempt, name='dispatch')
class RecordPlaybackView(APIView):
    # Cho phép truy cập không cần token để khớp với cách dùng user_id thủ công
    permission_classes = []

    def post(self, request, song_id):
        try:
            # Lấy user_id từ body (JSON)
            user_id = request.data.get('user_id')

            if not user_id:
                return Response({"message": "Thiếu user_id trong yêu cầu"}, status=status.HTTP_400_BAD_REQUEST)

            # Tìm User và Song trong Database
            user = get_object_or_404(User, pk=user_id)
            song = get_object_or_404(Song, pk=song_id)

            # Tạo lịch sử nghe. Việc này tự động tăng song.views qua hàm save() của model
            ListeningHistory.objects.create(user=user, song=song)

            return Response({
                "status": "success",
                "message": "Đã lưu lịch sử và tăng lượt nghe",
                "new_views": song.views
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({"message": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"message": "Bài hát không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- API LẤY DANH SÁCH LỊCH SỬ ---
class ListeningHistoryListView(generics.ListAPIView):
    serializer_class = HistorySerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            # Trả về 20 bài gần nhất
            return ListeningHistory.objects.filter(user_id=user_id).order_by('-played_at')[:20]
        return ListeningHistory.objects.none()


# server/music/views.py
from django.db.models import Max, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from django.urls import reverse
from .models import Song, Genre, Artist, ListeningHistory


class DiscoveryMusicView(APIView):
    permission_classes = []

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"message": "Thiếu user_id"}, status=400)

        # 1. Lấy 20 bài vừa nghe duy nhất (Không trùng lặp bài hát)
        recent_entries = ListeningHistory.objects.filter(user_id=user_id) \
            .values('song_id') \
            .annotate(latest_play=Max('played_at')) \
            .order_by('-latest_play')[:20]

        recent_ids = [item['song_id'] for item in recent_entries]

        # Lấy danh sách bài hát và giữ đúng thứ tự thời gian
        recent_songs = Song.objects.filter(id__in=recent_ids)
        recent_songs_sorted = sorted(recent_songs, key=lambda s: recent_ids.index(s.id))
        recent_songs_data = [self.format_song(s, request) for s in recent_songs_sorted]

        # 2. Chia nhỏ gợi ý theo Top 3 Thể loại hay nghe nhất
        top_genres = Genre.objects.filter(songs__played_by__user_id=user_id) \
            .annotate(usage=Count('id')).order_by('-usage')[:3]

        genre_recs = []
        for genre in top_genres:
            # Lấy 10 bài cùng thể loại, loại bỏ bài vừa nghe để tránh trùng
            songs = Song.objects.filter(genres=genre).exclude(id__in=recent_ids).distinct().order_by('?')[:10]
            if songs.exists():
                genre_recs.append({
                    "genre_name": genre.name,
                    "songs": [self.format_song(s, request) for s in songs]
                })

        # 3. Chia nhỏ gợi ý theo Top 3 Nghệ sĩ hay nghe nhất
        top_artists = Artist.objects.filter(songs__played_by__user_id=user_id) \
            .annotate(usage=Count('id')).order_by('-usage')[:3]

        artist_recs = []
        for artist in top_artists:
            # Lấy 10 bài của nghệ sĩ, loại bỏ bài vừa nghe
            songs = Song.objects.filter(artists=artist).exclude(id__in=recent_ids).distinct().order_by('?')[:10]
            if songs.exists():
                artist_recs.append({
                    "artist_name": artist.name,
                    "songs": [self.format_song(s, request) for s in songs]
                })

        return Response({
            "recently_played": recent_songs_data or [],
            "genres_grouped": genre_recs or [],
            "artists_grouped": artist_recs or [],
        })

    def format_song(self, s, request):
        cover_url = request.build_absolute_uri(s.cover_image.url) if s.cover_image else ""
        audio_url = request.build_absolute_uri(reverse('stream-song', args=[s.id]))
        artists = ", ".join([a.name for a in s.artists.all()])
        return {
            "id": s.id, "title": s.title, "artist": artists,
            "cover": cover_url, "audioUrl": audio_url, "views": s.views
        }


class GenreListView(APIView):
    permission_classes = []

    def get(self, request):
        # Sắp xếp thể loại theo số lượng bài hát giảm dần
        genres = Genre.objects.annotate(
            song_count=Count('songs')
        ).filter(song_count__gt=0).order_by('-song_count')

        data = []
        for genre in genres:
            # Lấy 15 bài hát tiêu biểu cho mỗi thể loại để hiển thị ở hàng ngang
            songs = Song.objects.filter(genres=genre).order_by('-views')[:15]
            data.append({
                "id": genre.id,
                "name": genre.name,
                "count": genre.song_count,
                "songs": [self.format_song(s, request) for s in songs]
            })

        return Response(data)

    def format_song(self, s, request):
        cover_url = request.build_absolute_uri(s.cover_image.url) if s.cover_image else ""
        audio_url = request.build_absolute_uri(reverse('stream-song', args=[s.id]))
        artists = ", ".join([a.name for a in s.artists.all()])
        return {
            "id": s.id,
            "title": s.title,
            "artist": artists,
            "cover": cover_url,
            "audioUrl": audio_url,
            "views": s.views
        }


class ChartListView(APIView):
    permission_classes = []

    def get(self, request):
        # 1. Top 100 bài hát phát nhiều nhất (theo views)
        top_played = Song.objects.all().order_by('-views')[:100]

        # 2. Top 100 bài hát được quan tâm nhất (theo số lượng bình luận)
        top_commented = Song.objects.annotate(
            comment_count=Count('comments')
        ).order_by('-comment_count')[:100]

        return Response({
            "top_played": [self.format_song(s, request) for s in top_played],
            "top_commented": [self.format_song(s, request, is_comment=True) for s in top_commented]
        })

    def format_song(self, s, request, is_comment=False):
        cover_url = request.build_absolute_uri(s.cover_image.url) if s.cover_image else ""
        audio_url = request.build_absolute_uri(reverse('stream-song', args=[s.id]))
        artists = ", ".join([a.name for a in s.artists.all()])

        data = {
            "id": s.id,
            "title": s.title,
            "artist": artists,
            "cover": cover_url,
            "audioUrl": audio_url,
            "views": s.views,
        }

        if is_comment:
            data["comment_count"] = getattr(s, 'comment_count', 0)

        return data