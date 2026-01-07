import { useState } from 'react';
import { Play, Clock, MoreHorizontal, Heart, ListMusic, Calendar, Music, PlusCircle } from 'lucide-react';
import { useMusic } from '../context/MusicContext.jsx';
import {useNavigate} from 'react-router-dom';

const PlayingEqualizer = () => (
    <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]"></div>
        <div className="w-[3px] bg-green-500 animate-[music-bar_0.4s_ease-in-out_infinite_0.2s]"></div>
        <style>{`@keyframes music-bar { 0%, 100% { height: 30%; } 50% { height: 100%; } }`}</style>
    </div>
);

export function PlaylistContent({ playlist, onAddSongToPlaylist }) {
    const { playSong, currentSong, isPlaying } = useMusic();
    const [likedSongs, setLikedSongs] = useState(new Set()); // State like cục bộ

    if (!playlist) return <div className="text-white p-8">Đang tải hoặc không tìm thấy...</div>;

    const songs = playlist.songs || [];
    const navigate = useNavigate();
    // Tính tổng thời gian
    const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const totalMin = Math.floor(totalDuration / 60);


    const handlePlayAll = () => {
        if (songs.length > 0) {
            playSong(songs[0], songs);
        }
    };

    const handleSongPlay = (song) => {
        // Khi click bài trong playlist, set luôn playlist đó làm hàng chờ
        playSong(song, songs);
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
            return newSet;
        });
    };

    const handleSongClick = (song) => { navigate(`/song/${song.id}`); };

    return (
        <div className="text-white pb-10">
            {/* --- HEADER BANNER --- */}
            <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-neutral-800 to-neutral-900/50">
                <div className="w-52 h-52 shadow-2xl shadow-black/50 shrink-0 rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center relative group">
                    {playlist.cover_image ? (
                        <img src={playlist.cover_image} alt={playlist.title} className="w-full h-full object-cover" />
                    ) : (
                        <ListMusic size={64} className="text-neutral-500" />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Playlist</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-4 line-clamp-2">{playlist.title}</h1>
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                        <div className="w-6 h-6 rounded-full bg-neutral-500 flex items-center justify-center text-xs text-black font-bold">
                            {playlist.user_name ? playlist.user_name[0] : 'U'}
                        </div>
                        <span className="text-white hover:underline cursor-pointer">{playlist.user_name || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{songs.length} bài hát, {totalMin} phút</span>
                    </div>
                </div>
            </div>

            {/* --- CONTROLS --- */}
            <div className="flex items-center gap-6 px-8 py-6 bg-neutral-900/20 backdrop-blur-sm sticky top-0 z-10">
                <button
                    onClick={handlePlayAll}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black"
                >
                    <Play size={28} fill="black" className="ml-1" />
                </button>
                <button className="text-neutral-400 hover:text-white transition-colors">
                    <Heart size={32} />
                </button>
                <button className="text-neutral-400 hover:text-white transition-colors">
                    <MoreHorizontal size={32} />
                </button>
            </div>

            {/* --- LIST SONGS (Grid Layout giống AlbumDetail) --- */}
            <div className="px-8">
                {/* Header Grid: Căn chỉnh giống AlbumDetail: [Index] [Title] [Artist] [Time] [Action] */}
                <div className="grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-2 border-b border-white/10 text-neutral-400 text-sm font-medium uppercase sticky top-20 bg-[#121212] z-0">
                    <div className="text-center">#</div>
                    <div>Tiêu đề</div>
                    <div>Nghệ sĩ</div>
                    <div className="text-right flex justify-end items-center"><Clock size={16}/></div>
                    <div className="text-center">Thao tác</div>
                </div>

                <div className="mt-2 flex flex-col">
                    {songs.length === 0 ? (
                        <div className="text-neutral-500 italic p-4 text-center">Chưa có bài hát nào trong playlist này.</div>
                    ) : (
                        songs.map((song, index) => {
                            const isCurrent = currentSong?.id === song.id;
                            const isLiked = likedSongs.has(song.id);

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => handleSongPlay(song)}
                                    className={`group grid grid-cols-[50px_4fr_3fr_1fr_100px] gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors items-center ${isCurrent ? 'bg-white/10' : 'hover:bg-neutral-800/50'}`}
                                >
                                    {/* 1. Số thứ tự / Play Icon / Equalizer */}
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

                                    {/* 2. Title & Cover */}
                                    <div className="flex items-center gap-3 overflow-hidden">
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
                                        {song.artist || "Unknown"}
                                    </div>

                                    {/* 4. Duration */}
                                    <div className="text-neutral-400 text-sm text-right font-variant-numeric tabular-nums">
                                        {song.duration ? `${Math.floor(song.duration/60)}:${(song.duration%60).toString().padStart(2,'0')}` : "--:--"}
                                    </div>

                                    {/* 5. Actions (Heart & Add) */}
                                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                            className={`hover:scale-125 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}
                                        >
                                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); onAddSongToPlaylist(song); }}
                                            className="text-neutral-400 hover:text-white hover:scale-125 transition-transform"
                                            title="Thêm vào Playlist khác"
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
    );
}