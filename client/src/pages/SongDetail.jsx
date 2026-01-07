import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Play,
    Clock,
    Music,
    ArrowLeft,
    Heart,
    PlusCircle,
    Disc,
    Mic2,
    Share2,
    User,           // Icon User
    MessageSquare,  // Icon Bình luận
    Send            // Icon Gửi
} from 'lucide-react';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { AddToPlaylistModal } from '../components/playlist_modal.jsx';

// Component Sóng nhạc
const PlayingEqualizer = () => (
    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.4s_ease-in-out_infinite_0.2s]"></div>
        <style>{`@keyframes music-bar { 0%, 100% { height: 30%; } 50% { height: 100%; } }`}</style>
    </div>
);

export function SongDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { playSong, currentSong, isPlaying } = useMusic();

    // Local State
    const [songInfo, setSongInfo] = useState(null);
    const [relatedSongs, setRelatedSongs] = useState([]);

    // State Bình luận (Lấy từ API)
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const [likedSongs, setLikedSongs] = useState(new Set());
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);

    // FETCH DỮ LIỆU BÀI HÁT & BÌNH LUẬN
    useEffect(() => {
        const fetchSongDetail = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/song/${id}/`);
                if (!res.ok) throw new Error("Lỗi tải bài hát");

                const data = await res.json();
                setSongInfo(data.info);
                setRelatedSongs(data.related);

                // Cập nhật danh sách comment từ API
                if (data.comments) {
                    setComments(data.comments);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSongDetail();
    }, [id]);

    // 2. HÀM GỬI BÌNH LUẬN GỌI API (POST)
    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        // Kiểm tra xem đã có user chưa (từ Context)
        if (!user || !user.id) {
            alert("Bạn cần đăng nhập để bình luận!");
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/music/song/${id}/comment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: newComment,
                    user_id: user.id
                })
            });

            const data = await res.json();

            if (data.status === 'success') {
                setComments(prev => [data.comment, ...prev]);
                setNewComment("");
            } else {
                alert(data.message || "Lỗi khi gửi bình luận");
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            alert("Không thể kết nối đến server");
        }
    };

    // --- CÁC HÀM XỬ LÝ KHÁC ---
    const handlePlayMainSong = () => {
        if (!songInfo) return;
        playSong(songInfo, [songInfo, ...relatedSongs]);
    };

    const handlePlayRelated = (song) => {
        playSong(song);
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
            return newSet;
        });
    };

    const openAddToPlaylist = (e, song) => {
        e.stopPropagation();
        setSelectedSongToAdd(song);
        setIsPlaylistModalOpen(true);
    };

    if (!songInfo) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Đang tải...</div>;

    const isMainActive = currentSong.title === songInfo.title;

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col relative overflow-hidden">
            {/* 1. BACKGROUND BLUR EFFECT */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-neutral-900/80 z-10"></div>
                {songInfo.cover && (
                    <img src={songInfo.cover} className="w-full h-full object-cover blur-3xl opacity-50 scale-110" alt="" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/80 to-transparent z-20"></div>
            </div>

            {/* 2. MAIN CONTENT */}
            <HeaderBar username="Oleny" />
            <div className="flex flex-1 z-30 relative">
                <Sidebar />
                <main className="flex-1 p-8 ml-64 pt-20 pb-32 overflow-y-auto">
                    <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2" /> Quay lại
                    </button>

                    {/* SONG HEADER INFO */}
                    <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                        <div className="w-64 h-64 md:w-72 md:h-72 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden shrink-0 border border-white/10 group relative">
                            {songInfo.cover ? <img src={songInfo.cover} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Music size={80} className="text-neutral-500"/></div>}

                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handlePlayMainSong}>
                                <Play size={64} fill="white" className="drop-shadow-lg"/>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <span className="text-sm font-bold uppercase text-green-400 tracking-wider flex items-center gap-2">
                                <Mic2 size={16}/> Bài hát
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">{songInfo.title}</h1>

                            <div className="flex items-center gap-4 text-neutral-300 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center"><User size={14}/></div>
                                    <span className="font-bold text-white hover:underline cursor-pointer">{songInfo.artist}</span>
                                </div>
                                <span>•</span>
                                <span>{songInfo.duration}</span>
                                <span>•</span>
                                <span>{songInfo.views.toLocaleString()} lượt nghe</span>
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                <button onClick={handlePlayMainSong} className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition-all shadow-lg text-black">
                                    {isMainActive && isPlaying ? <PlayingEqualizer /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                </button>
                                <button onClick={() => toggleLike(songInfo.id)} className={`p-3 rounded-full border border-neutral-600 hover:border-white transition-colors ${likedSongs.has(songInfo.id) ? 'text-green-500' : 'text-neutral-400'}`}>
                                    <Heart size={24} fill={likedSongs.has(songInfo.id) ? "currentColor" : "none"} />
                                </button>
                                <button onClick={(e) => openAddToPlaylist(e, songInfo)} className="p-3 rounded-full border border-neutral-600 hover:border-white transition-colors text-neutral-400 hover:text-white">
                                    <PlusCircle size={24} />
                                </button>
                                <button className="p-3 rounded-full border border-neutral-600 hover:border-white transition-colors text-neutral-400 hover:text-white">
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* CỘT TRÁI: DANH SÁCH BÀI LIÊN QUAN (Chiếm 2/3) */}
                        <div className="lg:col-span-2">
                            {relatedSongs.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Disc className="text-green-500"/> Có thể bạn muốn nghe</h2>
                                    <div className="flex flex-col mt-2">
                                        {relatedSongs.map((song) => {
                                            const isActive = currentSong.title === song.title;
                                            const isLiked = likedSongs.has(song.id);
                                            return (
                                                <div key={song.id} onClick={() => handlePlayRelated(song)} className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 items-center ${isActive ? 'bg-white/10 border-l-4 border-green-500' : 'hover:bg-neutral-800/50 border-l-4 border-transparent'}`}>
                                                    <div className="flex items-center gap-4">
                                                         <div className="w-12 h-12 rounded overflow-hidden relative shrink-0">
                                                            {song.cover ? <img src={song.cover} className="w-full h-full object-cover" alt={song.title}/> : <div className="bg-neutral-800 w-full h-full flex items-center justify-center"><Music size={20}/></div>}
                                                            {isActive && isPlaying ? (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><PlayingEqualizer/></div>
                                                            ) : (
                                                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center"><Play size={20} fill="white"/></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                                                            <p className="text-sm text-neutral-400">{song.artist}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-neutral-400">{song.duration}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className={`hover:scale-125 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}>
                                                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CỘT PHẢI: BÌNH LUẬN (Chiếm 1/3) */}
                        <div className="lg:col-span-1">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="text-green-500"/> Bình luận</h2>

                            {/* Ô nhập bình luận */}
                            <div className="bg-neutral-900/50 p-4 rounded-xl mb-6 backdrop-blur-sm border border-white/5 shadow-lg">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Viết cảm nghĩ của bạn về bài hát này..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 resize-none h-20 text-sm"
                                ></textarea>
                                <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-3">
                                    <span className="text-xs text-neutral-500">Nhấn Enter để gửi</span>
                                    <button
                                        onClick={handlePostComment}
                                        className="bg-green-500 hover:bg-green-400 text-black px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                        disabled={!newComment.trim()}
                                    >
                                        <Send size={14}/> Gửi
                                    </button>
                                </div>
                            </div>

                            {/* Danh sách bình luận */}
                            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {comments.length === 0 ? (
                                    <p className="text-neutral-500 text-sm italic text-center">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-neutral-700 to-neutral-600 flex items-center justify-center shrink-0 shadow-md border border-white/5">
                                                {/* Hiển thị Avatar nếu có, không thì icon User mặc định */}
                                                {comment.avatar ? (
                                                    <img src={comment.avatar} className="w-full h-full rounded-full object-cover"/>
                                                ) : (
                                                    <User size={14} className="text-neutral-300"/>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-sm text-white group-hover:text-green-400 transition-colors cursor-pointer">{comment.user}</span>
                                                    <span className="text-[10px] text-neutral-500">{comment.created_at}</span>
                                                </div>
                                                <div className="text-sm text-neutral-300 leading-relaxed bg-white/5 p-3 rounded-lg rounded-tl-none hover:bg-white/10 transition-colors">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                song={selectedSongToAdd}
                onConfirm={() => setIsPlaylistModalOpen(false)}
            />
        </div>
    );
}