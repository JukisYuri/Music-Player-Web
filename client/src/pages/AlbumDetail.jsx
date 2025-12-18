import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Music, ArrowLeft } from 'lucide-react';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { PlayerBar } from '../components/player_bar.jsx';
import { useTranslation } from 'react-i18next';

// 1. Component Sóng nhạc (Copy từ Index.jsx)
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

const getRandomColor = () => {
    const colors = ["from-blue-600 to-purple-600", "from-green-600 to-teal-600", "from-rose-600 to-orange-600", "from-yellow-500 to-red-600", "from-gray-600 to-slate-800"];
    return colors[Math.floor(Math.random() * colors.length)];
};

export function AlbumDetail() {
    const { t } = useTranslation();
    const { artistName } = useParams();
    const navigate = useNavigate();
    const decodedArtist = decodeURIComponent(artistName);

    const [albumSongs, setAlbumSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState({ title: "", artist: "", audioUrl: "", cover: "" });
    const [albumInfo, setAlbumInfo] = useState({ cover: "", color: getRandomColor() });

    // Fetch dữ liệu
    useEffect(() => {
        const fetchAlbumSongs = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/local-songs/`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const filtered = data.filter(song => song.artist === decodedArtist);
                    setAlbumSongs(filtered);

                    if (filtered.length > 0) {
                        setCurrentSong(filtered[0]);
                        setAlbumInfo({
                            cover: filtered[0].cover,
                            color: getRandomColor()
                        });
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchAlbumSongs();
    }, [decodedArtist]);

    // Logic Play
    const handlePlaySong = (song) => {
        setCurrentSong(song);
    };

    const handleNext = () => {
        if (albumSongs.length === 0) return;
        const idx = albumSongs.findIndex(s => s.title === currentSong.title);
        const nextIdx = (idx + 1) % albumSongs.length;
        handlePlaySong(albumSongs[nextIdx]);
    };

    const handlePrev = () => {
        if (albumSongs.length === 0) return;
        const idx = albumSongs.findIndex(s => s.title === currentSong.title);
        const prevIdx = (idx - 1 + albumSongs.length) % albumSongs.length;
        handlePlaySong(albumSongs[prevIdx]);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <HeaderBar username="Oleny" />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 relative overflow-y-auto ml-64 pt-16 pb-32">

                    {/* Nút Quay lại */}
                    <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2" /> Quay lại
                    </button>

                    {/* BANNER ALBUM */}
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                        <div className={`w-52 h-52 rounded-lg shadow-2xl relative overflow-hidden flex items-center justify-center bg-linear-to-br ${albumInfo.color}`}>
                            {albumInfo.cover && albumInfo.cover.startsWith("data:") ? (
                                <img src={albumInfo.cover} className="w-full h-full object-cover" alt="Album Cover" />
                            ) : (
                                <Music size={64} className="text-white/50" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2 mb-2">
                            <span className="text-sm font-bold uppercase text-white">Album / Tuyển Tập</span>
                            <h1 className="text-5xl md:text-7xl font-black text-white">{decodedArtist}</h1>
                            <div className="flex items-center gap-2 text-neutral-300 text-sm mt-2">
                                <span className="font-bold text-white">{decodedArtist}</span>
                                <span>• {albumSongs.length} bài hát</span>
                            </div>
                        </div>
                    </div>

                    {/* Nút Play Album */}
                    <div className="mb-8">
                        <button
                            onClick={() => handlePlaySong(albumSongs[0])}
                            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition-all shadow-lg"
                        >
                            <Play size={28} fill="black" className="text-black ml-1" />
                        </button>
                    </div>

                    {/* --- DANH SÁCH BÀI HÁT (GIỐNG HỆT INDEX) --- */}
                    <div className="grid grid-cols-[50px_4fr_3fr_1fr] gap-4 px-4 py-2 border-b border-neutral-800 text-sm text-neutral-400 font-medium uppercase tracking-wider">
                        <div className="text-center">#</div>
                        <div>Tiêu đề</div>
                        <div>Ca sĩ</div>
                        <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                    </div>

                    <div className="flex flex-col mt-2">
                        {albumSongs.map((song, index) => {
                            const isActive = currentSong.title === song.title;
                            return (
                                <div
                                    key={song.id}
                                    onClick={() => handlePlaySong(song)}
                                    className={`group grid grid-cols-[50px_4fr_3fr_1fr] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 items-center
                                        ${isActive ? 'bg-white/10 border-l-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'hover:bg-neutral-800/50 border-l-4 border-transparent'}
                                    `}
                                >
                                    {/* Cột 1: Số thứ tự hoặc Icon Play/Sóng nhạc */}
                                    <div className="text-center text-neutral-400 font-medium relative flex justify-center items-center h-full">
                                        {isActive ? <PlayingEqualizer /> : (
                                            <>
                                                <span className="group-hover:hidden">{index + 1}</span>
                                                <Play size={16} className="hidden group-hover:block text-white" />
                                            </>
                                        )}
                                    </div>

                                    {/* Cột 2: Ảnh nhỏ + Tên bài hát */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-700 rounded overflow-hidden shrink-0 relative">
                                            {song.cover && song.cover.startsWith("data:") ? (
                                                <img src={song.cover} className="w-full h-full object-cover" alt="cover"/>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-neutral-500"/></div>
                                            )}
                                        </div>
                                        <span className={`font-semibold text-base line-clamp-1 transition-colors ${isActive ? 'text-green-400' : 'text-white'}`}>{song.title}</span>
                                    </div>

                                    {/* Cột 3: Tên ca sĩ */}
                                    <div className={`text-sm line-clamp-1 ${isActive ? 'text-white' : 'text-neutral-400'}`}>{song.artist}</div>

                                    {/* Cột 4: Thời lượng */}
                                    <div className="text-right text-neutral-400 text-sm">{song.duration}</div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            <PlayerBar
                currentSong={currentSong.title}
                artist={currentSong.artist}
                audioUrl={currentSong.audioUrl}
                cover={currentSong.cover}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        </div>
    );
}