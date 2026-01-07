# server/suggest/views.py
from django.views import View
from django.http import JsonResponse
from music.models import Song  # <--- Import Model từ app khác
from .utils import jaccard_similarity  # Import logic từ utils cùng app


class SearchSuggestionView(View):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return JsonResponse([], safe=False)

        songs = Song.objects.all()

        scored_songs = []
        for song in songs:
            # Tính điểm Title
            score_title = jaccard_similarity(query, song.title)

            # Tính điểm Artist
            artist_names = " ".join([a.name for a in song.artists.all()])
            score_artist = jaccard_similarity(query, artist_names)

            final_score = max(score_title, score_artist)

            if final_score > 0.1:
                scored_songs.append((final_score, song))

        # Sắp xếp và lấy Top 5
        scored_songs.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_songs[:5]

        results = []
        for score, song in top_matches:
            # Helper tạo URL ảnh (nếu cần)
            cover_url = ""
            if song.cover_image:
                cover_url = request.build_absolute_uri(song.cover_image.url)

            results.append({
                "id": song.id,
                "title": song.title,
                "artist": ", ".join([a.name for a in song.artists.all()]),
                "cover": cover_url,
                "score": round(score, 2)
            })

        return JsonResponse(results, safe=False)


from django.shortcuts import render

# Create your views here.
