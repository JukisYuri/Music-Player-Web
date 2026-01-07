import { useState } from 'react';
import { X, Music, Disc, PlusCircle, ListMusic } from 'lucide-react'; // Import thêm icon ListMusic
import { useMusic } from '../context/MusicContext.jsx'; // Import Context

export function AddToPlaylistModal({ isOpen, onClose, song, onConfirm }) {
    // Lấy hàm addToQueue từ Context
    const { addToQueue } = useMusic();

    if (!isOpen) return null;

    const [myPlaylists, setMyPlaylists] = useState([
        { id: 1, title: "Nhạc Chill", count: 12 },
        { id: 2, title: "Nhạc tập Code", count: 45 },
        { id: 3, title: "Giai điệu buồn", count: 8 },
    ]);

    // Xử lý thêm vào Playlist cá nhân (Database)
    const handleAdd = (playlistId) => {
        console.log(`Đã thêm bài ${song.title} vào playlist ID ${playlistId}`);
        onConfirm(playlistId);
    };

    // Xử lý thêm vào Danh sách đang phát (Queue tạm thời)
    const handleAddToQueue = () => {
        addToQueue(song);
        alert("Đã thêm vào danh sách đang phát!");
        onClose();
    };

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
                        {song?.cover ? <img src={song.cover} className="w-full h-full object-cover" alt={song?.title}/> : <Music className="p-2 w-full h-full text-neutral-500"/>}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white line-clamp-1">{song?.title}</p>
                        <p className="text-xs text-neutral-400">{song?.artist}</p>
                    </div>
                </div>

                {/* Options List */}
                <div className="p-2 max-h-60 overflow-y-auto">

                    {/* --- MỤC MỚI: DANH SÁCH ĐANG PHÁT --- */}
                    <button
                        onClick={handleAddToQueue}
                        className="w-full flex items-center justify-between p-3 mb-2 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg group transition-colors text-left border border-neutral-700/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-900/30 rounded flex items-center justify-center text-green-500">
                                <ListMusic size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-green-400">Danh sách đang phát</p>
                                <p className="text-xs text-neutral-500">Thêm vào hàng đợi hiện tại</p>
                            </div>
                        </div>
                        <PlusCircle size={20} className="text-neutral-500 group-hover:text-green-500" />
                    </button>
                    {/* --------------------------------------- */}

                    <div className="my-2 border-t border-neutral-800"></div>

                    {/* Danh sách Playlist User */}
                    <p className="px-3 py-1 text-xs font-bold text-neutral-500 uppercase tracking-wider">Playlist của bạn</p>

                    {myPlaylists.map(pl => (
                        <button
                            key={pl.id}
                            onClick={() => handleAdd(pl.id)}
                            className="w-full flex items-center justify-between p-3 hover:bg-neutral-800 rounded-lg group transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center">
                                    <Disc size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{pl.title}</p>
                                    <p className="text-xs text-neutral-500">{pl.count} bài hát</p>
                                </div>
                            </div>
                            <PlusCircle size={20} className="text-neutral-500 group-hover:text-white" />
                        </button>
                    ))}

                    {/* Nút tạo mới */}
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800 rounded-lg group transition-colors text-left mt-1 border-t border-neutral-800/50">
                         <div className="w-10 h-10 bg-neutral-800 border border-dashed border-neutral-600 rounded flex items-center justify-center">
                            <PlusCircle size={20} className="text-neutral-400" />
                        </div>
                        <p className="font-medium text-neutral-300 group-hover:text-white">Tạo Playlist mới</p>
                    </button>
                </div>
            </div>
        </div>
    );
}