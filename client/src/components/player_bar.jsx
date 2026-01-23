import { useState, useRef, useEffect, memo } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, ListMusic,
    Volume1, VolumeX, Music, Heart, PlusCircle, X, Trash2, Shuffle
} from 'lucide-react';
import { SoundWaves } from './soundwave.jsx';
import { useTranslation } from 'react-i18next';
import { useMusic } from '../context/MusicContext.jsx';

// Memoized SongItem để tối ưu hiệu suất
const SongItem = memo(({ song, isActive, isPlaying, onClick, onRemove }) => {
    return (
        <div
            onClick={() => onClick(song)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group relative ${isActive ? 'bg-white/10 border-l-2 border-green-500' : 'hover:bg-neutral-800 border-l-2 border-transparent'}`}
        >
            <div className="w-10 h-10 rounded overflow-hidden shrink-0 relative">
                {song.cover ? (
                    <img src={song.cover} className="w-full h-full object-cover" alt={song.title} />
                ) : (
                    <div className="bg-neutral-700 w-full h-full flex items-center justify-center"><Music size={14}/></div>
                )}
                {isActive && isPlaying && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><SoundWaves/></div>}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onRemove(song.id); }} className="p-2 text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
            </button>
        </div>
    );
});

export function PlayerBar({
    currentSong = '', artist = "...", audioUrl = "", cover = "",
    onNext, onPrev, onPlayingChange, playlist = [], onPlaySong, forceIsPlaying, onRemoveFromQueue
}) {
    const { t } = useTranslation();
    const { isShuffle, setIsShuffle } = useMusic(); // Lấy từ context

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const volumeRef = useRef(null);

    useEffect(() => { if (forceIsPlaying !== undefined) setIsPlaying(forceIsPlaying); }, [forceIsPlaying]);

    // Fetch nhạc vào Blob để tránh giật lag khi chuyển bài
    useEffect(() => {
        if (!audioUrl) return;
        const loadSong = async () => {
            try {
                const response = await fetch(audioUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                setCurrentTime(0);
            } catch (err) { console.error("Lỗi nạp nhạc:", err); }
        };
        loadSong();
    }, [audioUrl]);

    useEffect(() => {
        if (blobUrl && audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
        }
    }, [blobUrl]);

    const onAudioEnded = () => {
        setIsPlaying(false);
        if (onNext) onNext(); // Gọi logic handleNext (có kèm xóa bài) ở Context
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
    };

    // Logic Tua nhạc (Seek)
    const updateSeek = (clientX) => {
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audioRef.current.currentTime = percent * duration;
    };

    const handleSeekDown = (e) => {
        setIsDragging(true);
        updateSeek(e.clientX);
        const move = (ev) => updateSeek(ev.clientX);
        const up = () => { setIsDragging(false); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    };

    const queueTracks = playlist.filter(s => s.title !== currentSong);

    return (
        <footer className="fixed bottom-0 left-0 w-full h-20 bg-neutral-900 border-t border-neutral-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] select-none">
            {showPlaylist && (
                <div className="absolute bottom-24 right-4 w-80 md:w-96 max-h-[60vh] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-[60]">
                    <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/95 backdrop-blur sticky top-0 z-10">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2"><ListMusic size={20} className="text-green-500"/> Danh sách phát</h3>
                        <button onClick={() => setShowPlaylist(false)} className="text-neutral-400 hover:text-white"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-green-500 uppercase mb-2 px-1">Đang phát</h4>
                            <SongItem song={{title: currentSong, artist, cover}} isActive={true} isPlaying={isPlaying} onClick={onPlaySong} onRemove={onRemoveFromQueue} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-neutral-400 uppercase mb-2 px-1">Tiếp theo</h4>
                            {queueTracks.map((s, i) => <SongItem key={s.id || i} song={s} isActive={false} onClick={onPlaySong} onRemove={onRemoveFromQueue} />)}
                        </div>
                    </div>
                </div>
            )}

            <audio ref={audioRef} src={blobUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={() => !isDragging && setCurrentTime(audioRef.current.currentTime)} onLoadedMetadata={() => setDuration(audioRef.current.duration)} onEnded={onAudioEnded} />

            <div className="max-w-[1400px] h-full mx-auto px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-[30%] min-w-0">
                    <div className="w-14 h-14 rounded-md overflow-hidden border border-white/10">
                        {cover ? <img src={cover} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Music size={24}/></div>}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-semibold truncate text-white">{t(currentSong) || currentSong}</p>
                        <p className="text-xs text-neutral-400 truncate">{artist}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-[40%]">
                    <div className="flex gap-6 mb-1 text-neutral-300 items-center">
                        <button onClick={onPrev} className='hover:text-white'><SkipBack size={20}/></button>
                        <button onClick={togglePlay} className='hover:text-green-500 transform active:scale-105'>
                            {isPlaying ? <Pause size={25} fill="currentColor"/> : <Play size={25} fill="currentColor"/>}
                        </button>
                        <button onClick={onNext} className='hover:text-white'><SkipForward size={20}/></button>
                    </div>

                    <div className="relative w-full h-4 flex items-center gap-2">
                        <span className="text-xs text-neutral-400 w-10 text-right">{Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')}</span>
                        <div ref={progressRef} onMouseDown={handleSeekDown} className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer relative group hover:h-1.5 transition-all">
                            <div className="h-full bg-green-500 rounded-full relative" style={{width: `${(currentTime/duration)*100}%`}}>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <span className="text-xs text-neutral-400 w-10">{Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}</span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 w-[30%]">
                    <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-colors ${isShuffle ? 'text-green-500' : 'hover:text-white'}`} title="Phát ngẫu nhiên"><Shuffle size={18} /></button>
                    <Volume2 size={20} className="text-neutral-400"/>
                    <div ref={volumeRef} onMouseDown={(e) => {
                        const move = (ev) => {
                            const r = volumeRef.current.getBoundingClientRect();
                            const v = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
                            audioRef.current.volume = v; setVolume(v);
                        };
                        move(e);
                        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
                        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
                    }} className="w-24 h-1 bg-neutral-700 rounded-full cursor-pointer"><div className="h-full bg-neutral-300" style={{width: `${volume * 100}%`}}></div></div>
                    <button onClick={() => setShowPlaylist(!showPlaylist)} className={`ml-2 ${showPlaylist ? 'text-green-500' : 'text-neutral-400'}`}><ListMusic size={20}/></button>
                </div>
            </div>
        </footer>
    );
}