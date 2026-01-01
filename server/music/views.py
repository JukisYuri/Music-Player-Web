# server/music/views.py
import os
import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC


class LocalMusicListView(APIView):
    def get(self, request):
        # Đường dẫn thư mục: data/music
        # Vì MEDIA_ROOT đã trỏ vào 'data', ta chỉ cần nối thêm 'music'
        music_dir = os.path.join(settings.MEDIA_ROOT, 'music')

        if not os.path.exists(music_dir):
            return Response([], status=200)

        songs = []
        index = 1

        for filename in os.listdir(music_dir):
            if filename.endswith(".mp3"):
                file_path = os.path.join(music_dir, filename)

                # Tạo URL để React truy cập file nhạc
                # Ví dụ: http://localhost:8000/media/music/tenbaihat.mp3
                audio_url = request.build_absolute_uri(f'{settings.MEDIA_URL}music/{filename}')

                try:
                    audio = MP3(file_path)
                    tags = ID3(file_path)

                    # Lấy thông tin (Metadata)
                    title = tags.get('TIT2')
                    artist = tags.get('TPE1')
                    duration = int(audio.info.length)

                    # Xử lý tiêu đề nếu không có tag
                    title_text = str(title) if title else filename.replace(".mp3", "").replace("_", " ")
                    artist_text = str(artist) if artist else "Unknown Artist"

                    # Format thời gian (Giây -> mm:ss) cho đẹp
                    minutes = duration // 60
                    seconds = duration % 60
                    duration_str = f"{minutes}:{seconds:02d}"

                    # Xử lý Ảnh bìa (Cover Art) -> Chuyển sang Base64
                    cover_data = "https://placehold.co/400?text=Music"  # Ảnh mặc định
                    apic_frames = tags.getall("APIC")

                    if apic_frames:
                        img_data = apic_frames[0].data
                        mime_type = apic_frames[0].mime
                        base64_img = base64.b64encode(img_data).decode('utf-8')
                        cover_data = f"data:{mime_type};base64,{base64_img}"

                    songs.append({
                        "id": index,
                        "title": title_text,
                        "artist": artist_text,
                        "duration": duration_str,
                        "audioUrl": audio_url,  # Link trực tiếp
                        "cover": cover_data,  # Ảnh base64
                        "filename": filename
                    })
                    index += 1

                except Exception as e:
                    print(f"Lỗi đọc file {filename}: {e}")
                    continue

        return Response(songs)