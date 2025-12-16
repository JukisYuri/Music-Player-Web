# server/music/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import yt_dlp

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "http://localhost:5173"

class YouTubeStreamView(APIView):

    def get(self, request):
        query = request.query_params.get('query')
        if not query:
            return Response({"error": "Thiếu tham số query"}, status=status.HTTP_400_BAD_REQUEST)

        ydl_opts = {
            'format': 'bestaudio/best',
            'noplaylist': True,
            'quiet': True,
            'default_search': 'ytsearch',
            'skip_download': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"ytsearch1:{query}", download=False)

                if 'entries' in info:
                    video = info['entries'][0]
                else:
                    video = info

                return Response({
                    "title": video.get('title'),
                    "artist": video.get('uploader'),
                    "thumbnail": video.get('thumbnail'),
                    "duration": video.get('duration'),
                    "audio_url": video.get('url'),
                    "web_url": video.get('webpage_url')
                })

        except Exception as e:
            print(f"Lỗi: {e}")
            return Response({"error": "Không tìm thấy bài hát hoặc lỗi server"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)