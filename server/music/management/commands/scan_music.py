import os
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from music.models import Song, Artist, Genre
from mutagen.mp3 import MP3
from mutagen.id3 import ID3


class Command(BaseCommand):
    help = 'Quet nhac, goi API de lay the loai va ho tro da nghe si'

    def get_genres_from_api(self, file_path):
        """Goi API Audd.io de lay thong tin the loai"""
        api_token = "499953db8d64d6955bbb933414176786"  # Thay token cua ban tai day
        url = "https://api.audd.io/"

        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                data = {
                    'api_token': api_token,
                    'return': 'apple_music',
                }
                response = requests.post(url, data=data, files=files, timeout=20)
                result = response.json()

            if result.get('status') == 'success' and result.get('result'):
                apple_data = result['result'].get('apple_music')
                if apple_data and apple_data.get('genreNames'):
                    # Tra ve danh sach the loai
                    return apple_data['genreNames']
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Loi API: {e}"))
        return []

    def handle(self, *args, **kwargs):
        MP3_FOLDER = 'mp3'
        IMG_FOLDER = 'images'
        music_dir = os.path.join(settings.MEDIA_ROOT, MP3_FOLDER)
        image_dir = os.path.join(settings.MEDIA_ROOT, IMG_FOLDER)

        if not os.path.exists(music_dir):
            return

        files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
        self.stdout.write(f'Tim thay {len(files)} file nhac...')

        for filename in files:
            file_path = os.path.join(music_dir, filename)
            try:
                # 1. Doc Metadata co san
                tags = ID3(file_path)
                audio = MP3(file_path)
                title = str(tags.get('TIT2')) if tags.get('TIT2') else filename.replace('.mp3', '')
                artist_raw = str(tags.get('TPE1')) if tags.get('TPE1') else "Unknown Artist"
                duration = int(audio.info.length)

                # 2. Xu ly Nghe si
                artist_names = [name.strip() for name in artist_raw.split(',')]
                artist_objs = [Artist.objects.get_or_create(name=name)[0] for name in artist_names]

                # 3. Goi API lay the loai
                self.stdout.write(f"Dang goi API cho: {title}...")
                genre_names = self.get_genres_from_api(file_path)

                genre_objs = []
                for g_name in genre_names:
                    g_obj, _ = Genre.objects.get_or_create(name=g_name)
                    genre_objs.append(g_obj)

                # 4. Anh cover
                cover_rel_path = None
                base_name = os.path.splitext(filename)[0]
                for ext in ['.jpg', '.jpeg', '.png']:
                    if os.path.exists(os.path.join(image_dir, f"{base_name}{ext}")):
                        cover_rel_path = os.path.join(IMG_FOLDER, f"{base_name}{ext}")
                        break

                # 5. Luu Song
                song_obj, created = Song.objects.update_or_create(
                    title=title,
                    defaults={
                        'audio_file': os.path.join(MP3_FOLDER, filename),
                        'duration': duration,
                        'cover_image': cover_rel_path
                    }
                )

                # Cap nhat Quan he
                song_obj.artists.set(artist_objs)
                if genre_objs:
                    song_obj.genres.set(genre_objs)

                self.stdout.write(f'- {title} | Genres: {", ".join(genre_names)}')

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Err {filename}: {e}'))

        # Cap nhat song_count
        for art in Artist.objects.all():
            art.song_count = art.songs.count()
            art.save()

        self.stdout.write(self.style.SUCCESS('--- HOAN TAT ---'))