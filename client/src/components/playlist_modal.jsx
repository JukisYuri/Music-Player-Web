import { useState, useEffect } from 'react';
import { X, Music, Disc, PlusCircle, ListMusic, Loader2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext.jsx';
import { useAuth } from '../context/auth_context.jsx';

export function AddToPlaylistModal({ isOpen, onClose, song, onConfirm }) {
    const { addToQueue } = useMusic();
    const { user } = useAuth();

    // States
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState("");

    // 1. Fetch Playlist khi mở Modal (Dùng User ID)
    useEffect(() => {
        if (isOpen && user) {
            fetchPlaylists();
        }
    }, [isOpen, user]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            // Gửi user_id qua URL param
            const res = await fetch(`http://127.0.0.1:8000/api/music/my-playlists/?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setMyPlaylists(data);
            }
        } catch (err) {
            console.error("Lỗi lấy playlist:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Tạo Playlist mới (Gửi User ID trong body)
    const handleCreatePlaylist = async () => {
        if (!newPlaylistTitle.trim()) return;

        if (!user || !user.id) {
            alert("Vui lòng đăng nhập lại!");
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/music/my-playlists/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // KHÔNG CẦN Authorization HEADER
                },
                body: JSON.stringify({
                    title: newPlaylistTitle,
                    is_public: false,
                    user_id: user.id  // <--- Quan trọng: Gửi ID user
                })
            });

            if (res.ok) {
                await fetchPlaylists(); // Tải lại danh sách
                setIsCreating(false);
                setNewPlaylistTitle("");
            } else {
                alert("Không thể tạo playlist (Lỗi server)");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 3. Thêm bài hát vào Playlist (Gửi User ID trong body để xác thực quyền sở hữu)
    const handleAdd = async (playlistId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/music/playlist/${playlistId}/add-song/${song.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id // <--- Gửi ID user để backend kiểm tra
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Đã thêm vào playlist thành công!");
                onConfirm(playlistId);
                onClose();
            } else {
                alert(data.message || "Lỗi khi thêm bài hát");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    };

    const handleAddToQueue = () => {
        addToQueue(song);
        alert("Đã thêm vào danh sách đang phát!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 w-full max-w-md rounded-xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-800/50">
                    <h3 className="font-bold text-lg text-white">Thêm vào...</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Song Info */}
                <div className="p-4 flex items-center gap-3 bg-neutral-800/30">
                    <div className="w-12 h-12 rounded overflow-hidden bg-neutral-700 shrink-0">
                        {song?.cover ? <img src={song.cover} className="w-full h-full object-cover" /> : <Music className="p-2 w-full h-full text-neutral-500"/>}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white line-clamp-1">{song?.title}</p>
                        <p className="text-xs text-neutral-400">{song?.artist}</p>
                    </div>
                </div>

                {/* List */}
                <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {/* Add to Queue */}
                    <button onClick={handleAddToQueue} className="w-full flex items-center justify-between p-3 mb-2 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg group transition-colors text-left border border-neutral-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-900/30 rounded flex items-center justify-center text-green-500"><ListMusic size={20} /></div>
                            <div><p className="font-medium text-green-400">Danh sách đang phát</p></div>
                        </div>
                        <PlusCircle size={20} className="text-neutral-500 group-hover:text-green-500" />
                    </button>

                    <div className="my-2 border-t border-neutral-800"></div>

                    <p className="px-3 py-1 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Playlist của bạn</p>

                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-green-500"/></div>
                    ) : (
                        myPlaylists.map(pl => (
                            <button key={pl.id} onClick={() => handleAdd(pl.id)} className="w-full flex items-center justify-between p-3 hover:bg-neutral-800 rounded-lg group transition-colors text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center overflow-hidden">
                                        {pl.cover_image ? <img src={pl.cover_image} className="w-full h-full object-cover"/> : <Disc size={20} className="text-neutral-400"/>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{pl.title}</p>
                                        <p className="text-xs text-neutral-500">{pl.song_count} bài hát</p>
                                    </div>
                                </div>
                                <PlusCircle size={20} className="text-neutral-500 group-hover:text-white" />
                            </button>
                        ))
                    )}

                    {/* Form tạo playlist mới */}
                    {isCreating ? (
                        <div className="mt-2 p-3 bg-neutral-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Tên playlist mới..."
                                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none mb-2"
                                value={newPlaylistTitle}
                                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-xs text-neutral-400 hover:text-white">Hủy</button>
                                <button onClick={handleCreatePlaylist} className="px-3 py-1 text-xs bg-green-500 text-black font-bold rounded hover:bg-green-400">Tạo</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsCreating(true)} className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800 rounded-lg group transition-colors text-left mt-1 border-t border-neutral-800/50">
                             <div className="w-10 h-10 bg-neutral-800 border border-dashed border-neutral-600 rounded flex items-center justify-center">
                                <PlusCircle size={20} className="text-neutral-400" />
                            </div>
                            <p className="font-medium text-neutral-300 group-hover:text-white">Tạo Playlist mới</p>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}