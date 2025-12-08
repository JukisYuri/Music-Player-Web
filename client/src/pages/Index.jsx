import { useState, useEffect } from 'react';
import { PlayerBar } from '../components/player_bar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';
import { PlaylistTracks } from '../components/playlist_and_album.jsx';
import { Play, Clock, Music, Disc, Heart, MoreHorizontal } from 'lucide-react'; // Import thêm icon Disc, Heart

const PlayingEqualizer = () => (
    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.4s_ease-in-out_infinite_0.2s]"></div>
        <style>{`
            @keyframes music-bar {
                0%, 100% { height: 30%; }
                50% { height: 100%; }
            }
        `}</style>
    </div>
);

const initialSongs = [
    { id: 1, title: "Em Của Ngày Hôm Qua", artist: "Sơn Tùng M-TP", duration: "3:50", query: "Sơn Tùng MTP Em của ngày hôm qua", audioUrl: "", cover: "" },
    { id: 2, title: "Chúng Ta Của Tương Lai", artist: "Sơn Tùng M-TP", duration: "4:10", query: "Chúng ta của tương lai Sơn Tùng MTP", audioUrl: "", cover: "" },
    { id: 3, title: "Hồng Nhan", artist: "Jack - J97", duration: "3:15", query: "Hồng Nhan Jack", audioUrl: "", cover: "" },
    { id: 4, title: "Thiên Lý Ơi", artist: "Jack - J97", duration: "3:40", query: "Thiên Lý Ơi Jack", audioUrl: "", cover: "" },
    { id: 5, title: "Mơ Hồ", artist: "Bùi Anh Tuấn", duration: "4:30", query: "Mơ Hồ Bùi Anh Tuấn", audioUrl: "", cover: "" },
];

const albums = [
    { id: 1, title: "Sky Tour 2019", artist: "Sơn Tùng M-TP", color: "from-blue-600 to-purple-600" },
    { id: 2, title: "Lofi Chill 2024", artist: "Various Artists", color: "from-green-600 to-teal-600" },
    { id: 3, title: "V-Pop Ballad", artist: "Tuyển Tập", color: "from-rose-600 to-orange-600" },
    { id: 4, title: "Rap Việt Mùa 3", artist: "Rap Việt", color: "from-yellow-500 to-red-600" },
    { id: 5, title: "Indie Buồn", artist: "Vũ., Chillies", color: "from-gray-600 to-slate-800" },
];

export function Index() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playlist, setPlaylist] = useState(initialSongs);
    const [currentSong, setCurrentSong] = useState({
        title: "Đang tải dữ liệu...",
        artist: "Vui lòng đợi",
        audioUrl: "",
        cover: ""
    });

    useEffect(() => {
        const fetchAllLinks = async () => {
            let updatedList = [...initialSongs];

            for (let i = 0; i < updatedList.length; i++) {
                const song = updatedList[i];
                try {
                    const res = await fetch(`http://127.0.0.1:8000/api/music/stream/?query=${encodeURIComponent(song.query)}`);
                    const data = await res.json();

                    if (data.audio_url) {
                        updatedList[i] = {
                            ...song,
                            audioUrl: data.audio_url,
                            cover: data.thumbnail
                        };
                        setPlaylist([...updatedList]);
                        if (i === 0) {
                            setCurrentSong({
                                title: data.title,
                                artist: data.artist,
                                audioUrl: data.audio_url,
                                cover: data.thumbnail
                            });
                        }
                    }
                } catch (err) { console.error(err); }
            }
        };
        fetchAllLinks();
    }, []);

    // --- PLAY LOGIC ---
    const handlePlaySong = (song) => {
        if (song.audioUrl) {
            setCurrentSong({
                title: song.title,
                artist: song.artist,
                audioUrl: song.audioUrl,
                cover: song.cover
            });
        } else {
            playSongFromQuery(song.query);
        }
    };

    const playSongFromQuery = async (query) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/music/stream/?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.audio_url) {
                setCurrentSong({
                    title: data.title,
                    artist: data.artist,
                    audioUrl: data.audio_url,
                    cover: data.thumbnail
                });
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <HeaderBar onLogoutClick={() => setIsModalOpen(true)} username="Oleny"/>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 relative overflow-y-auto ml-64 pt-16 pb-32">

                    {/* === BANNER === */}
                    <div className="relative h-64 md:h-80 flex items-end justify-start mb-10 mt-5 bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                        {currentSong.cover ? (
                            <img src={currentSong.cover} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-md scale-110 group-hover:scale-100 transition-all duration-700"/>
                        ) : (
                            <div className="absolute inset-0 bg-linear-to-br from-green-900/30 to-neutral-900"></div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
                        <div className="relative z-10 p-8 flex flex-col items-start w-full">
                            <p className="text-sm font-medium text-green-400 uppercase tracking-wider mb-2 flex items-center">
                                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                Đang phát
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 line-clamp-2">{currentSong.title}</h1>
                            <p className="text-xl text-neutral-300 font-medium">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* === TRACKLIST === */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">Top Thịnh Hành</h2>
                        </div>
                        <div className="grid grid-cols-[50px_4fr_3fr_1fr] gap-4 px-4 py-2 border-b border-neutral-800 text-sm text-neutral-400 font-medium uppercase tracking-wider">
                            <div className="text-center">#</div>
                            <div>Tiêu đề</div>
                            <div>Nghệ sĩ</div>
                            <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                        </div>
                        <div className="flex flex-col mt-2">
                            {playlist.map((song, index) => {
                                const isActive = currentSong.title === song.title;
                                return (
                                    <div
                                        key={song.id}
                                        onClick={() => handlePlaySong(song)}
                                        className={`group grid grid-cols-[50px_4fr_3fr_1fr] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 items-center
                                            ${isActive ? 'bg-white/10 border-l-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'hover:bg-neutral-800/50 border-l-4 border-transparent'}
                                        `}
                                    >
                                        <div className="text-center text-neutral-400 font-medium relative flex justify-center items-center h-full">
                                            {isActive ? <PlayingEqualizer /> : <><span className="group-hover:hidden">{index + 1}</span><Play size={16} className="hidden group-hover:block text-white" /></>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-700 rounded overflow-hidden shrink-0 relative">
                                                {song.cover ? <img src={song.cover} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-neutral-500"/></div>}
                                            </div>
                                            <span className={`font-semibold text-base line-clamp-1 transition-colors ${isActive ? 'text-green-400' : 'text-white'}`}>{song.title}</span>
                                        </div>
                                        <div className={`text-sm line-clamp-1 ${isActive ? 'text-white' : 'text-neutral-400'}`}>{song.artist}</div>
                                        <div className="text-right text-neutral-400 text-sm">{song.duration}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* === ALBUMS === */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Disc className="text-green-500"/> Album Phổ Biến
                            </h2>
                            <button className="text-sm text-neutral-400 hover:text-white transition-colors">Xem tất cả</button>
                        </div>

                        <PlaylistTracks albums={albums} />
                    </section>
                </main>
            </div>

            <PlayerBar
                currentSong={currentSong.title}
                artist={currentSong.artist}
                audioUrl={currentSong.audioUrl}
                cover={currentSong.cover}
            />

            <LogoutConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => setIsModalOpen(false)} />
        </div>
    );
}