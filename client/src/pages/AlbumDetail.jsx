import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from '../components/sidebar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { PlayerBar } from '../components/player_bar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';
import { AddToPlaylistModal } from '../components/playlist_modal.jsx';
import { useAuth } from '../context/auth_context.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { Play, Clock, Music, Heart, PlusCircle, MoreHorizontal, ArrowLeft, Disc } from 'lucide-react';

// Component Sóng nhạc (Equalizer)
const PlayingEqualizer = () => (
    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.4s_ease-in-out_infinite_0.2s]"></div>
        <style>{`@keyframes music-bar { 0%, 100% { height: 30%; } 50% { height: 100%; } }`}</style>
    </div>
);

export function AlbumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { playSong, currentSong, isPlaying } = useMusic();

    // --- STATES ---
    const [albumSongs, setAlbumSongs] = useState([]);
    const [albumInfo, setAlbumInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State xử lý lỗi ảnh (để fallback)
    const [imageError, setImageError] = useState(false);

    // State Modals & Interaction
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);
    const [likedSongs, setLikedSongs] = useState(new Set());

    const handleSongClick = (song) => { navigate(`/song/${song.id}`); };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchAlbumDetail = async () => {
            setLoading(true);
            setError(null);
            setImageError(false);
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/album/${id}/`);
                if (!res.ok) {
                    setError("Không tìm thấy Album hoặc lỗi kết nối.");
                } else {
                    const data = await res.json();
                    if (data.songs) setAlbumSongs(data.songs);
                    if (data.info) setAlbumInfo(data.info);
                }
            } catch (err) {
                console.error("Lỗi tải album:", err);
                setError("Lỗi kết nối server.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAlbumDetail();
    }, [id]);

    const displayCover = (albumInfo?.cover && !imageError)
        ? albumInfo.cover
        : (albumSongs.length > 0 && albumSongs[0].cover)
            ? albumSongs[0].cover
            : null;

    // --- HANDLERS ---
    const handlePlayAlbum = () => {
        if (albumSongs.length > 0) {
            playSong(albumSongs[0], albumSongs);
        }
    };

    const handleSongPlay = (song) => {
        playSong(song, albumSongs);
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

    return (
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212] overflow-hidden text-white">
            <HeaderBar onLogoutClick={() => setIsLogoutModalOpen(true)} username={user?.display_name || "Oleny"}/>

            <div className="col-span-2">
                <Sidebar />
            </div>

            <div className="col-span-10 pt-16 h-full mb-20 overflow-y-auto custom-scrollbar relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full">Đang tải...</div>
                ) : error || !albumInfo ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2">
                        <span className="text-xl font-bold text-white">⚠️ Thông báo</span>
                        <p>{error || "Thông tin album trống."}</p>
                        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20">Quay lại</button>
                    </div>
                ) : (
                    <div className="pb-10">
                        {/* Nút Back */}
                        {/*<div className="px-8 pt-6">*/}
                        {/*    <button onClick={() => navigate(-1)} className="flex items-center text-neutral-400 hover:text-white transition-colors">*/}
                        {/*        <ArrowLeft className="mr-2" size={20} /> Quay lại*/}
                        {/*    </button>*/}
                        {/*</div>*/}

                        {/* --- BANNER HEADER --- */}
                        <div className="flex items-end gap-6 p-8 pt-4 bg-gradient-to-b from-neutral-800 to-neutral-900/50">
                            <div className="w-52 h-52 shadow-2xl shadow-black/50 shrink-0 rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center relative group border border-white/5">
                                {displayCover ? (
                                    <img
                                        src={displayCover}
                                        alt={albumInfo.title}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <Disc size={64} className="text-neutral-500" />
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-green-500">Album</span>
                                <h1 className="text-5xl md:text-7xl font-black mb-4 line-clamp-2">{albumInfo.title}</h1>
                                <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                                    <div className="w-6 h-6 rounded-full bg-neutral-500 flex items-center justify-center text-xs text-black font-bold">
                                        {albumInfo.artist ? albumInfo.artist[0] : 'A'}
                                    </div>
                                    <span className="text-white hover:underline cursor-pointer font-bold">{albumInfo.artist}</span>
                                    <span>•</span>
                                    <span>{new Date().getFullYear()}</span>
                                    <span>•</span>
                                    <span>{albumSongs.length} bài hát</span>
                                </div>
                            </div>
                        </div>

                        {/* --- CONTROLS --- */}
                        <div className="flex items-center gap-6 px-8 py-6 bg-neutral-900/20 backdrop-blur-sm sticky top-0 z-10">
                            <button
                                onClick={handlePlayAlbum}
                                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black"
                            >
                                <Play size={28} fill="black" className="ml-1" />
                            </button>
                            <button className="text-neutral-400 hover:text-white transition-colors p-2">
                                <Heart size={32} />
                            </button>
                            <button className="text-neutral-400 hover:text-white transition-colors p-2">
                                <MoreHorizontal size={32} />
                            </button>
                        </div>

                        {/* --- SONG LIST --- */}
                        <div className="px-8">
                            <div className="grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-2 border-b border-white/10 text-neutral-400 text-sm font-medium uppercase sticky top-20 bg-[#121212] z-0">
                                <div className="text-center">#</div>
                                <div>Tiêu đề</div>
                                <div>Nghệ sĩ</div>
                                <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                                <div className="text-center">Thao tác</div>
                            </div>

                            <div className="mt-2 flex flex-col">
                                {albumSongs.length === 0 ? (
                                    <div className="text-neutral-500 italic p-4 text-center">Album chưa có bài hát nào.</div>
                                ) : (
                                    albumSongs.map((song, index) => {
                                        const isCurrent = currentSong?.id === song.id;
                                        const isLiked = likedSongs.has(song.id);

                                        return (
                                            <div
                                                key={song.id}
                                                onClick={() => handleSongPlay(song)}
                                                className={`group grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors items-center ${isCurrent ? 'bg-white/10' : 'hover:bg-neutral-800/50'}`}
                                            >
                                                {/* 1. Index / Play / EQ */}
                                                <div className="text-center text-neutral-400 font-medium relative flex justify-center items-center h-full">
                                                    {isCurrent && isPlaying ? (
                                                        <PlayingEqualizer />
                                                    ) : isCurrent && !isPlaying ? (
                                                        <Play size={16} className="text-green-500" fill="currentColor"/>
                                                    ) : (
                                                        <>
                                                            <span className="group-hover:hidden">{index + 1}</span>
                                                            <Play size={16} className="hidden group-hover:block text-white" fill="white"/>
                                                        </>
                                                    )}
                                                </div>

                                                {/* 2. Title */}
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {/* Ảnh nhỏ bài hát */}
                                                    <div className="w-10 h-10 rounded bg-neutral-800 shrink-0 overflow-hidden relative">
                                                        {song.cover ? (
                                                            <img src={song.cover} className="w-full h-full object-cover" alt={song.title}/>
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-neutral-500"/></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col truncate">
                                                        <span
                                                            onClick={(e) => {e.stopPropagation(); handleSongClick(song);}}
                                                            className={`font-medium truncate text-base ${isCurrent ? 'text-green-500' : 'text-white'}`}>
                                                            {song.title}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 3. Artist */}
                                                <div className="text-neutral-400 text-sm truncate group-hover:text-white">
                                                    {song.artist || albumInfo.artist}
                                                </div>

                                                {/* 4. Duration */}
                                                <div className="text-neutral-400 text-sm text-right font-variant-numeric tabular-nums">
                                                    {song.duration}
                                                </div>

                                                {/* 5. Actions */}
                                                <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                        className={`hover:scale-125 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}
                                                    >
                                                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                                    </button>

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
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => setIsLogoutModalOpen(false)}
            />

            <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                song={selectedSongToAdd}
                onConfirm={() => setIsPlaylistModalOpen(false)}
            />
        </div>
    );
}