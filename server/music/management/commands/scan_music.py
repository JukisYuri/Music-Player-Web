import os
import time
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from django.core.management.base import BaseCommand
from django.conf import settings
from music.models import Song, Artist, Genre
from mutagen.mp3 import MP3
from mutagen.id3 import ID3

# Load bien moi truong tu file .env
load_dotenv()


class Command(BaseCommand):
    help = 'Quet nhac, dung Spotify API lay the loai va cap nhat database'

    def setup_spotify(self):
        """Khoi tao Spotify client tu file .env"""
        client_id = os.getenv("SPOTIFY_CLIENT_ID")
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

        if not client_id or not client_secret:
            self.stdout.write(self.style.ERROR("Khong tim thay CLIENT_ID hoac CLIENT_SECRET trong file .env"))
            return None

        auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        return spotipy.Spotify(auth_manager=auth_manager)

    def get_genres_from_spotify(self, sp, title, artist_name):
        """Tim kiem thong tin the loai tu Spotify dua tren ten bai hat va ca si"""
        try:
            # Query fuzzy de tang ti le khop
            query = f"{title} {artist_name}"
            results = sp.search(q=query, type='track', limit=1, market='VN')

            if not results['tracks']['items']:
                return []

            track = results['tracks']['items'][0]
            genres = []

            # Lay Genre tu tat ca artist tham gia bai hat
            for artist in track['artists']:
                artist_info = sp.artist(artist['id'])
                if artist_info.get('genres'):
                    genres.extend(artist_info['genres'])

            return list(set(genres))  # Loai bo cac the loai trung lap
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Loi goi Spotify cho {title}: {e}"))
            return []

    def handle(self, *args, **kwargs):
        sp = self.setup_spotify()
        if not sp:
            return

        MP3_FOLDER = 'mp3'
        IMG_FOLDER = 'images'
        music_dir = os.path.join(settings.MEDIA_ROOT, MP3_FOLDER)
        image_dir = os.path.join(settings.MEDIA_ROOT, IMG_FOLDER)

        if not os.path.exists(music_dir):
            self.stdout.write(self.style.ERROR(f"Thu muc nhac khong ton tai: {music_dir}"))
            return

        files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
        self.stdout.write(f'Tim thay {len(files)} file mp3. Bat dau scan...')

        for filename in files:
            file_path = os.path.join(music_dir, filename)
            try:
                # 1. Doc ID3 Metadata tu file vat ly
                tags = ID3(file_path)
                audio = MP3(file_path)

                title = str(tags.get('TIT2')) if tags.get('TIT2') else filename.replace('.mp3', '')
                artist_raw = str(tags.get('TPE1')) if tags.get('TPE1') else "Unknown Artist"
                duration = int(audio.info.length)

                # 2. Xu ly Nghe si (tach dau phay)
                artist_names = [name.strip() for name in artist_raw.split(',')]
                artist_objs = [Artist.objects.get_or_create(name=name)[0] for name in artist_names]

                # 3. Lay va tao The loai tu Spotify
                self.stdout.write(f"Dang tim kiem the loai cho: {title}...")
                genre_names = self.get_genres_from_spotify(sp, title, artist_names[0])

                genre_objs = []
                for g_name in genre_names:
                    g_obj, _ = Genre.objects.get_or_create(name=g_name)
                    genre_objs.append(g_obj)

                # 4. Xu ly anh cover cuc bo
                cover_rel_path = None
                base_name = os.path.splitext(filename)[0]
                for ext in ['.jpg', '.jpeg', '.png']:
                    full_img_path = os.path.join(image_dir, f"{base_name}{ext}")
                    if os.path.exists(full_img_path):
                        cover_rel_path = os.path.join(IMG_FOLDER, f"{base_name}{ext}")
                        break

                # 5. Luu vao database
                song_obj, created = Song.objects.update_or_create(
                    title=title,
                    defaults={
                        'audio_file': os.path.join(MP3_FOLDER, filename),
                        'duration': duration,
                        'cover_image': cover_rel_path
                    }
                )

                # Cap nhat quan he ManyToMany
                song_obj.artists.set(artist_objs)
                if genre_objs:
                    song_obj.genres.set(genre_objs)

                self.stdout.write(f"Done: {title} | Genres: {', '.join(genre_names) if genre_names else 'N/A'}")

                # Nghi 0.1s de tranh Rate Limit
                time.sleep(0.1)

            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Loi xu ly file {filename}: {e}"))

        # 6. Cap nhat song_count cho tat ca nghe si
        self.stdout.write("Cap nhat song_count cho cac nghe si...")
        for art in Artist.objects.all():
            art.song_count = art.songs.count()
            art.save()

        self.stdout.write(self.style.SUCCESS('--- HOAN TAT QUY TRINH SCAN ---'))