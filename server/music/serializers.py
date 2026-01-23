# server/music/serializers.py
from rest_framework import serializers
from .models import Playlist, Song, PlaylistSong, ListeningHistory


# 1. SỬA LẠI CLASS NÀY: Serializer hiển thị bài hát trong Playlist
class SongInPlaylistSerializer(serializers.ModelSerializer):
    # Đổi tên biến cho khớp với Frontend (giống cấu trúc Album trả về)
    artist = serializers.SerializerMethodField()
    cover = serializers.SerializerMethodField()
    audioUrl = serializers.SerializerMethodField()

    class Meta:
        model = Song
        # Khai báo các field mới đổi tên
        fields = ['id', 'title', 'cover', 'duration', 'artist', 'audioUrl']

    def get_artist(self, obj):
        # Logic cũ của get_artist_names
        return ", ".join([artist.name for artist in obj.artists.all()])

    def get_cover(self, obj):
        # Logic cũ của get_cover_image
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_audioUrl(self, obj):
        # Logic cũ của get_audio_file
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None


# 2. Serializer cho danh sách Playlist (Thư viện) - GIỮ NGUYÊN
class PlaylistSerializer(serializers.ModelSerializer):
    song_count = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'is_public', 'song_count', 'created_at', 'cover_image']

    def get_song_count(self, obj):
        return obj.songs.count()

    def get_cover_image(self, obj):
        first_song_relation = PlaylistSong.objects.filter(playlist=obj).order_by('order', 'added_at').first()
        if first_song_relation and first_song_relation.song.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_song_relation.song.cover_image.url)
            return first_song_relation.song.cover_image.url
        return None


# 3. Serializer chi tiết Playlist - GIỮ NGUYÊN (Nó sẽ tự dùng SongInPlaylistSerializer mới ở trên)
class PlaylistDetailSerializer(serializers.ModelSerializer):
    songs = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.display_name', read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'cover_image', 'user_name', 'is_public', 'songs', 'created_at']

    def get_cover_image(self, obj):
        first_song_relation = PlaylistSong.objects.filter(playlist=obj).order_by('order', 'added_at').first()
        if first_song_relation and first_song_relation.song.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_song_relation.song.cover_image.url)
            return first_song_relation.song.cover_image.url
        return None

    def get_songs(self, obj):
        playlist_songs = PlaylistSong.objects.filter(playlist=obj).order_by('order', 'added_at')
        songs = [ps.song for ps in playlist_songs]
        # Gọi serializer đã sửa
        return SongInPlaylistSerializer(songs, many=True, context=self.context).data


# 4. Serializer tạo Playlist - GIỮ NGUYÊN
class CreatePlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['title', 'is_public']


class HistorySerializer(serializers.ModelSerializer):
    song = SongInPlaylistSerializer(read_only=True)

    class Meta:
        model = ListeningHistory
        fields = ['id', 'song', 'played_at']