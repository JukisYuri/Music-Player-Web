import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {HeaderBar} from '../components/header_bar.jsx';
import {Sidebar} from '../components/sidebar.jsx';
import {LogoutConfirmModal} from '../components/logout_confirm_modal.jsx';
import {PlaylistTracks} from '../components/playlist_and_album.jsx';
import {AddToPlaylistModal} from '../components/playlist_modal.jsx';
import {Play, Clock, Music, Disc, Heart, PlusCircle, ListMusic, ChevronRight, Mic2, Loader2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useMusic} from '../context/MusicContext.jsx';
import {useAuth} from '../context/auth_context.jsx';

const PlayingEqualizer = () => (
    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.4s_ease-in-out_infinite_0.2s]"></div>
        <style>{`@keyframes music-bar { 0%, 100% { height: 30%; } 50% { height: 100%; } }`}</style>
    </div>
);

export function Index() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {playSong, currentSong, isPlaying} = useMusic();
    const {user} = useAuth();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);

    // Data States
    const [playlist, setPlaylist] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artistAlbums, setArtistAlbums] = useState([]);
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [likedSongs, setLikedSongs] = useState(new Set());

    // 1. Fetch Local Music
    useEffect(() => {
        const fetchLocalSongs = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/local-songs/`);
                const data = await res.json();
                if (Array.isArray(data)) setPlaylist(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLocalSongs();
    }, []);

    // 2. Fetch Top Albums
    useEffect(() => {
        const fetchTopAlbums = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/top-albums/`);
                const data = await res.json();
                if (Array.isArray(data)) setAlbums(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTopAlbums();
    }, []);

    //2.1 Fetch Artist Album
    useEffect(() => {
        const fetchArtistAlbums = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/artist-albums/`);
                const data = await res.json();
                if (Array.isArray(data)) setArtistAlbums(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchArtistAlbums();
    }, []);

    // 3. Fetch Playlist
    useEffect(() => {
        const fetchMyPlaylists = async () => {
            if (!user || !user.id) {
                setMyPlaylists([]);
                return;
            }
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/my-playlists/?user_id=${user.id}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                });

                if (res.ok) {
                    const data = await res.json();
                    setMyPlaylists(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchMyPlaylists();
    }, [user]);

    // --- Handlers ---
    const handlePlaySingleSong = (song) => {
        playSong(song);
    };
    const handleSongClick = (song) => {
        navigate(`/song/${song.id}`);
    };
    const handleViewAlbum = (album) => {
        navigate(`/album/${album.id}`);
    };
    const handleViewPlaylist = (pl) => {
        navigate(`/playlist/${pl.id}`);
    };
    const handleViewArtist = (artistItem) => {
        navigate(`/artist/${artistItem.id}`);
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
            return newSet;
        });
    };

    const openAddToPlaylistModal = (e, song) => {
        e.stopPropagation();
        setSelectedSongToAdd(song);
        setIsPlaylistModalOpen(true);
    };

    const handlePlaylistAdded = () => {
        setIsPlaylistModalOpen(false);
        setSelectedSongToAdd(null);
    };

    // --- HELPER: Chuyển đổi dữ liệu Playlist cho khớp với cấu trúc của Album Component ---
    // Vì PlaylistTracks dùng props: { title, cover, artist }
    const playlistForRender = myPlaylists.map(pl => ({
        id: pl.id,
        title: pl.title,
        cover: pl.cover_image, // Map 'cover_image' thành 'cover'
        artist: `${pl.song_count || 0} bài hát`, // Hiển thị số bài hát ở vị trí tên ca sĩ
        isPlaylist: true
    }));

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <HeaderBar onLogoutClick={() => setIsLogoutModalOpen(true)} username={user?.display_name || "User"}/>
            <div className="flex flex-1">
                <Sidebar/>
                <main className="flex-1 p-8 relative overflow-y-auto ml-64 pt-16 pb-32">

                    {/* BANNER */}
                    <div
                        className="relative h-64 md:h-80 flex items-end justify-start mb-10 mt-5 bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                        {currentSong.cover ? (
                            <img src={currentSong.cover} alt="Banner"
                                 className="absolute inset-0 w-full h-full object-cover opacity-40 blur-md scale-110 group-hover:scale-100 transition-all duration-700"/>
                        ) : (
                            <div className="absolute inset-0 bg-linear-to-br from-green-900/30 to-neutral-900"></div>
                        )}
                        <div
                            className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
                        <div className="relative z-10 p-8 flex flex-col items-start w-full">
                            {currentSong.audioUrl ? (
                                <>
                                    <p className="text-sm font-medium text-green-400 uppercase tracking-wider mb-2 flex items-center">
                                        <span
                                            className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                        {t('home_page.now_playing')}
                                    </p>
                                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 line-clamp-2">{currentSong.title}</h1>
                                    <p className="text-xl text-neutral-300 font-medium">{currentSong.artist}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">{t('home_page.welcome')}</p>
                                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">{t('home_page.ready_to_play')}</h1>
                                    <p className="text-xl text-neutral-300 font-medium">{t('home_page.choose_song')}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- PLAYLIST CỦA TÔI (Đã đồng bộ giao diện) --- */}
                    {user && myPlaylists.length > 0 && (
                        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <ListMusic className="text-green-500"/>
                                    {t('home_page.my_play_list')}
                                </h2>
                                {myPlaylists.length > 5 && (
                                    <button onClick={() => navigate('/playlist')}
                                            className="text-sm font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center hover:underline">
                                        {t('home_page.see_all')} <ChevronRight size={16}/>
                                    </button>
                                )}
                            </div>

                            <PlaylistTracks
                                albums={playlistForRender.slice(0, 5)}
                                onPlayAlbum={(pl) => handleViewPlaylist(pl)} // Click nút play -> Vào chi tiết
                                onAlbumClick={(pl) => handleViewPlaylist(pl)} // Click vào thẻ -> Vào chi tiết
                            />
                        </section>
                    )}

                    {/* TOP SONGS (Giữ nguyên) */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">{t('home_page.popular_music')} (Top
                                10)</h2>
                        </div>
                        <div
                            className="grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-2 border-b border-neutral-800 text-sm text-neutral-400 font-medium uppercase tracking-wider">
                            <div className="text-center">#</div>
                            <div>{t('home_page.title_music')}</div>
                            <div>{t('home_page.title_artist')}</div>
                            <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                            <div className="text-center">{t('home_page.operation')}</div>
                        </div>
                        <div className="flex flex-col mt-2">
                            {playlist.slice(0, 10).map((song, index) => {
                                const isActive = currentSong.title === song.title;
                                const isLiked = likedSongs.has(song.id);
                                return (
                                    <div key={song.id} onClick={() => handlePlaySingleSong(song)}
                                         className={`group grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 items-center ${isActive ? 'bg-white/10 border-l-4 border-green-500' : 'hover:bg-neutral-800/50 border-l-4 border-transparent'}`}>
                                        <div
                                            className="text-center text-neutral-400 font-medium relative flex justify-center items-center h-full">
                                            {isActive && isPlaying ? <PlayingEqualizer/> : isActive && !isPlaying ?
                                                <Play size={16} className="text-green-500" fill="currentColor"/> : <>
                                                    <span className="group-hover:hidden">{index + 1}</span><Play
                                                    size={16} className="hidden group-hover:block text-white"/></>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 bg-neutral-700 rounded overflow-hidden shrink-0 relative">
                                                {song.cover ?
                                                    <img src={song.cover} className="w-full h-full object-cover"
                                                         alt={song.title}/> :
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Music size={16} className="text-neutral-500"/></div>}
                                            </div>
                                            <span onClick={(e) => {
                                                e.stopPropagation();
                                                handleSongClick(song);
                                            }}
                                                  className={`font-semibold text-base line-clamp-1 transition-colors ${isActive ? 'text-green-400' : 'text-white'}`}>{song.title}</span>
                                        </div>
                                        <div
                                            className={`text-sm line-clamp-1 ${isActive ? 'text-white' : 'text-neutral-400'}`}>{song.artist}</div>
                                        <div className="text-right text-neutral-400 text-sm">{song.duration}</div>
                                        <div
                                            className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(song.id);
                                            }}
                                                    className={`hover:scale-125 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}>
                                                <Heart size={18} fill={isLiked ? "currentColor" : "none"}/></button>
                                            <button onClick={(e) => openAddToPlaylistModal(e, song)}
                                                    className="text-neutral-400 hover:text-white hover:scale-125 transition-transform"
                                                    title="Thêm vào Playlist"><PlusCircle size={18}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* POPULAR ALBUMS (Giữ nguyên) */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Disc
                                className="text-green-500"/> {t('home_page.popular_albums')} (Top View)</h2>
                        </div>
                        <PlaylistTracks
                            albums={albums}
                            onPlayAlbum={(album) => {
                                if (album.songs?.length > 0) playSong(album.songs[0], album.songs);
                            }}
                            onAlbumClick={handleViewAlbum}
                        />
                    </section>
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Mic2 className="text-green-500"/>
                                {t('home_page.album_according_to_artist')}
                            </h2>
                        </div>
                        <PlaylistTracks
                            albums={artistAlbums}
                            onPlayAlbum={(item) => handleViewArtist(item)}
                            onAlbumClick={handleViewArtist}
                        />
                    </section>
                </main>
            </div>
            <LogoutConfirmModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)}
                                onConfirm={() => setIsLogoutModalOpen(false)}/>
            <AddToPlaylistModal isOpen={isPlaylistModalOpen} onClose={() => setIsPlaylistModalOpen(false)}
                                song={selectedSongToAdd} onConfirm={handlePlaylistAdded}/>
        </div>
    );
}