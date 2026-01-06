import os
from django.views import View
from django.http import JsonResponse, FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.urls import reverse
from .models import Song
from .models import Album
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
        # Lấy tất cả bài hát, sắp xếp mới nhất
        songs = Song.objects.all().order_by('-views')
        # songs = Song.objects.all()

        data = []
        for song in songs:
            # Xử lý URL ảnh cover
            cover_url = ""
            if song.cover_image:
                cover_url = request.build_absolute_uri(song.cover_image.url)

            stream_url = reverse('stream-song', args=[song.id])
            audio_url = request.build_absolute_uri(stream_url)

            # Format thời gian (Giây -> mm:ss)
            m = song.duration // 60
            s = song.duration % 60
            duration_fmt = f"{m}:{s:02d}"

            data.append({
                "id": song.id,
                "title": song.title,
                "artist": song.artist.name if song.artist else "Unknown",
                "cover": cover_url,
                "audioUrl": audio_url,  # React sẽ gọi link này
                "duration": duration_fmt,
                "views": song.views
            })

        # safe=False cho phép trả về List JSON thay vì Dict
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
            return JsonResponse({'status': 'error', 'message': 'Song not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)




