import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Music, ArrowLeft, Heart, PlusCircle } from 'lucide-react';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { AddToPlaylistModal } from '../components/playlist_modal.jsx';

// Component Sóng nhạc (Tái sử dụng)
const PlayingEqualizer = () => (
    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.4s_ease-in-out_infinite_0.2s]"></div>
        <style>{`@keyframes music-bar { 0%, 100% { height: 30%; } 50% { height: 100%; } }`}</style>
    </div>
);

const getRandomColor = () => {
    const colors = ["from-blue-600 to-purple-600", "from-green-600 to-teal-600", "from-rose-600 to-orange-600", "from-yellow-500 to-red-600", "from-gray-600 to-slate-800"];
    return colors[Math.floor(Math.random() * colors.length)];
};

export function AlbumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { playSong, currentSong, isPlaying } = useMusic();

    const [albumSongs, setAlbumSongs] = useState([]);

    // 2. State cho Modal Playlist
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);

    // State lưu thông tin Album
    const [albumInfo, setAlbumInfo] = useState({
        title: "Đang tải...",
        artist: "",
        cover: "",
        color: getRandomColor()
    });

    const [likedSongs, setLikedSongs] = useState(new Set());

    // Fetch Album Detail & Songs theo ID
    useEffect(() => {
        const fetchAlbumDetail = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/album/${id}/`);
                if (!res.ok) throw new Error("Không tải được album");

                const data = await res.json();

                if (data.songs) setAlbumSongs(data.songs);

                if (data.info) {
                    setAlbumInfo(prev => ({
                        ...prev,
                        title: data.info.title,
                        artist: data.info.artist,
                        cover: data.info.cover
                    }));
                }
            } catch (err) {
                console.error(err);
            }
        };

        if (id) fetchAlbumDetail();
    }, [id]);

    const handlePlaySong = (song) => {
        // Chỉ play bài này, giữ nguyên queue hiện tại (đã sửa ở bước trước)
        playSong(song);
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
            return newSet;
        });
    };

    // 3. Hàm xử lý mở Modal
    const openAddToPlaylistModal = (e, song) => {
        e.stopPropagation(); // Ngăn việc click vào hàng (play nhạc)
        setSelectedSongToAdd(song);
        setIsPlaylistModalOpen(true);
    };

    const handlePlaylistAdded = () => {
        // Xử lý sau khi thêm xong (ví dụ hiện thông báo)
        setIsPlaylistModalOpen(false);
        setSelectedSongToAdd(null);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <HeaderBar username="Oleny" />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 relative overflow-y-auto ml-64 pt-16 pb-32">
                    <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2" /> Quay lại
                    </button>

                    {/* BANNER */}
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                        <div className={`w-52 h-52 rounded-lg shadow-2xl relative overflow-hidden flex items-center justify-center bg-linear-to-br ${albumInfo.color}`}>
                            {albumInfo.cover ? (
                                <img src={albumInfo.cover} className="w-full h-full object-cover" alt={albumInfo.title}/>
                            ) : (
                                <Music size={64} className="text-white/50" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2 mb-2">
                            <span className="text-sm font-bold uppercase text-white">Album</span>
                            <h1 className="text-5xl md:text-7xl font-black text-white">{albumInfo.title}</h1>
                            <div className="flex items-center gap-2 text-neutral-300 text-sm mt-2">
                                <span className="font-bold text-white">{albumInfo.artist}</span>
                                <span>• {albumSongs.length} bài hát</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        {/* Nút Play to: Có thể sửa thành Play cả album nếu muốn */}
                        <button onClick={() => albumSongs.length > 0 && handlePlaySong(albumSongs[0])} className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition-all shadow-lg">
                            <Play size={28} fill="black" className="text-black ml-1" />
                        </button>
                    </div>

                    {/* LIST SONGS HEADER */}
                    <div className="grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-2 border-b border-neutral-800 text-sm text-neutral-400 font-medium uppercase tracking-wider">
                        <div className="text-center">#</div>
                        <div>Tiêu đề</div>
                        <div>Ca sĩ</div>
                        <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                        <div className="text-center">Thao tác</div>
                    </div>

                    {/* LIST SONGS BODY */}
                    <div className="flex flex-col mt-2">
                        {albumSongs.map((song, index) => {
                            const isActive = currentSong.title === song.title;
                            const isLiked = likedSongs.has(song.id);

                            return (
                                <div key={song.id} onClick={() => handlePlaySong(song)} className={`group grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 items-center ${isActive ? 'bg-white/10 border-l-4 border-green-500' : 'hover:bg-neutral-800/50 border-l-4 border-transparent'}`}>

                                    <div className="text-center text-neutral-400 font-medium relative flex justify-center items-center h-full">
                                        {isActive && isPlaying ? <PlayingEqualizer /> : isActive && !isPlaying ? <Play size={16} className="text-green-500" fill="currentColor"/> : <><span className="group-hover:hidden">{index + 1}</span><Play size={16} className="hidden group-hover:block text-white" /></>}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-700 rounded overflow-hidden shrink-0 relative">
                                            {song.cover ? (
                                                <img src={song.cover} className="w-full h-full object-cover" alt={song.title}/>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-neutral-500"/></div>
                                            )}
                                        </div>
                                        <span className={`font-semibold text-base line-clamp-1 transition-colors ${isActive ? 'text-green-400' : 'text-white'}`}>{song.title}</span>
                                    </div>

                                    <div className={`text-sm line-clamp-1 ${isActive ? 'text-white' : 'text-neutral-400'}`}>{song.artist}</div>
                                    <div className="text-right text-neutral-400 text-sm">{song.duration}</div>

                                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className={`hover:scale-125 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}>
                                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                        </button>

                                        {/* 4. Sửa nút Add to Playlist */}
                                        <button
                                            onClick={(e) => openAddToPlaylistModal(e, song)}
                                            className="text-neutral-400 hover:text-white hover:scale-125 transition-transform"
                                            title="Thêm vào Playlist"
                                        >
                                            <PlusCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* 5. Render Modal */}
            <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                song={selectedSongToAdd}
                onConfirm={handlePlaylistAdded}
            />
        </div>
    );
}