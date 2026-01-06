import os
import base64
from django.views import View
from django.http import JsonResponse, FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.conf import settings
from .models import Song
from .models import Album
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
        songs = Song.objects.all().prefetch_related('artists')
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