import {useState, useEffect} from 'react';
import {PlayerBar} from '../components/player_bar.jsx';
import {HeaderBar} from '../components/header_bar.jsx';
import {Sidebar} from '../components/sidebar.jsx';
import {LogoutConfirmModal} from '../components/logout_confirm_modal.jsx';
import {PlaylistTracks} from '../components/playlist_and_album.jsx';
import {Play, Clock, Music, Disc, Heart, PlusCircle} from 'lucide-react';
import {useTranslation} from 'react-i18next';

// --- Helper Components & Functions ---
const getRandomColor = () => {
    const colors = ["from-blue-600 to-purple-600", "from-green-600 to-teal-600", "from-rose-600 to-orange-600", "from-yellow-500 to-red-600", "from-gray-600 to-slate-800"];
    return colors[Math.floor(Math.random() * colors.length)];
};

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data States
    const [playlist, setPlaylist] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [likedSongs, setLikedSongs] = useState(new Set()); // Quản lý danh sách yêu thích

    // Playback States
    const [currentQueue, setCurrentQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState({
        title: "Sẵn sàng",
        artist: "Chọn bài hát...",
        audioUrl: "",
        cover: ""
    });
    const [isPlaying, setIsPlaying] = useState(false); // Đồng bộ trạng thái Play/Pause

    // 1. Fetch Local Music
    useEffect(() => {
        const fetchLocalSongs = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/local-songs/`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setPlaylist(data);
                    setCurrentQueue(data);
                    // setCurrentSong(data[0]);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchLocalSongs();
    }, []);

    // 2. Group Albums by Artist
    useEffect(() => {
        if (playlist.length === 0) return;
        const grouped = {};
        playlist.forEach(song => {
            const artist = song.artist || "Unknown";
            if (!grouped[artist]) {
                grouped[artist] = {
                    id: `alb-${artist}`,
                    title: `Tuyển tập ${artist}`,
                    artist: artist,
                    cover: song.cover,
                    color: getRandomColor(),
                    songs: []
                };
            }
            grouped[artist].songs.push(song);
        });
        setAlbums(Object.values(grouped));
    }, [playlist]);

    // 3. Play Logic
    const handlePlaySong = (song) => {
        setCurrentSong({
            title: song.title,
            artist: song.artist,
            audioUrl: song.audioUrl,
            cover: song.cover
        });
        fetch(`http://127.0.0.1:8000/api/music/view/${song.id}/`, {
            method: 'POST'
        });
    };


    const handlePlaySingleSong = (song) => {
        if (currentQueue !== playlist) setCurrentQueue(playlist);
        handlePlaySong(song);
    };

    const handlePlayAlbum = (album) => {
        if (album.songs?.length > 0) {
            setCurrentQueue(album.songs);
            handlePlaySong(album.songs[0]);
        }
    };

    // 4. Next/Prev Logic
    const handleNext = () => {
        if (currentQueue.length === 0) return;
        const idx = currentQueue.findIndex(s => s.title === currentSong.title);
        const nextIdx = (idx + 1) % currentQueue.length;
        handlePlaySong(currentQueue[nextIdx]);
    };

    const handlePrev = () => {
        if (currentQueue.length === 0) return;
        const idx = currentQueue.findIndex(s => s.title === currentSong.title);
        const prevIdx = (idx - 1 + currentQueue.length) % currentQueue.length;
        handlePlaySong(currentQueue[prevIdx]);
    };

    // 5. User Actions (Like/Add)
    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <HeaderBar onLogoutClick={() => setIsModalOpen(true)} username="Oleny"/>
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
                            <p className="text-sm font-medium text-green-400 uppercase tracking-wider mb-2 flex items-center">
                                <span
                                    className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                {t('home_page.now_playing')}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 line-clamp-2">{currentSong.title}</h1>
                            <p className="text-xl text-neutral-300 font-medium">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* TOP 10 SONGS */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">{t('home_page.popular_music')} (Top
                                10)</h2>
                        </div>
                        {/* Grid 5 columns: # | Title | Artist | Time | Actions */}
                        <div
                            className="grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-2 border-b border-neutral-800 text-sm text-neutral-400 font-medium uppercase tracking-wider">
                            <div className="text-center">#</div>
                            <div>{t('home_page.title_music')}</div>
                            <div>{t('home_page.title_artist')}</div>
                            <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                            <div className="text-center">Thao tác</div>
                        </div>

                        <div className="flex flex-col mt-2">
                            {playlist.slice(0, 10).map((song, index) => {
                                const isActive = currentSong.title === song.title;
                                const isLiked = likedSongs.has(song.id);
                                return (
                                    <div key={song.id} onClick={() => handlePlaySingleSong(song)}
                                         className={`group grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 items-center ${isActive ? 'bg-white/10 border-l-4 border-green-500' : 'hover:bg-neutral-800/50 border-l-4 border-transparent'}`}>

                                        {/* Cột 1: STT / Icon */}
                                        <div
                                            className="text-center text-neutral-400 font-medium relative flex justify-center items-center h-full">
                                            {isActive && isPlaying ? <PlayingEqualizer/> : isActive && !isPlaying ?
                                                <Play size={16} className="text-green-500" fill="currentColor"/> : <>
                                                    <span className="group-hover:hidden">{index + 1}</span><Play
                                                    size={16} className="hidden group-hover:block text-white"/></>}
                                        </div>

                                        {/* Cột 2: Title & Cover */}
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 bg-neutral-700 rounded overflow-hidden shrink-0 relative">
                                                {song.cover ? (
                                                    <img src={song.cover} className="w-full h-full object-cover"
                                                         alt={song.title}/>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Music size={16} className="text-neutral-500"/>
                                                    </div>
                                                )}
                                            </div>
                                            <span
                                                className={`font-semibold text-base line-clamp-1 transition-colors ${isActive ? 'text-green-400' : 'text-white'}`}>{song.title}</span>
                                        </div>

                                        {/* Cột 3: Artist */}
                                        <div
                                            className={`text-sm line-clamp-1 ${isActive ? 'text-white' : 'text-neutral-400'}`}>{song.artist}</div>

                                        {/* Cột 4: Time */}
                                        <div className="text-right text-neutral-400 text-sm">{song.duration}</div>

                                        {/* Cột 5: Actions */}
                                        <div
                                            className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(song.id);
                                            }}
                                                    className={`hover:scale-125 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}>
                                                <Heart size={18} fill={isLiked ? "currentColor" : "none"}/>
                                            </button>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                alert("Đã thêm vào playlist!");
                                            }}
                                                    className="text-neutral-400 hover:text-white hover:scale-125 transition-transform">
                                                <PlusCircle size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ALBUMS */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Disc
                                className="text-green-500"/> {t('home_page.popular_albums')}</h2>
                        </div>
                        <PlaylistTracks albums={albums} onPlayAlbum={handlePlayAlbum}/>
                    </section>
                </main>
            </div>

            <PlayerBar
                currentSong={currentSong.title}
                artist={currentSong.artist}
                audioUrl={currentSong.audioUrl}
                cover={currentSong.cover}
                onNext={handleNext}
                onPrev={handlePrev}
                onPlayingChange={(status) => setIsPlaying(status)}
                playlist={currentQueue}
                onPlaySong={handlePlaySong}
            />

            <LogoutConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                                onConfirm={() => setIsModalOpen(false)}/>
        </div>
    );
}