import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Volume1, VolumeX, Music } from 'lucide-react';
import { SoundWaves } from './soundwave.jsx';
import { useTranslation } from 'react-i18next';

export function PlayerBar({ currentSong, artist, audioUrl, cover, onNext, onPrev }) {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const volumeRef = useRef(null);

    // Khi URL thay đổi -> Load & Play
    useEffect(() => {
        if (audioRef.current && audioUrl) {
            setCurrentTime(0);
            audioRef.current.load();
            audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }, [audioUrl]);

    // Audio Event Handlers
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
        setIsPlaying(false);
        if (onNext) onNext(); // Tự động Next
    };
    const onTimeUpdate = () => {
        if (audioRef.current && !isDragging) setCurrentTime(audioRef.current.currentTime);
    };
    const onLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
    };

    // Seek Logic
    const updateSeek = (clientX) => {
        if (!progressRef.current || !audioRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audioRef.current.currentTime = percent * duration;
        setCurrentTime(percent * duration);
    };
    const handleSeekDown = (e) => {
        setIsDragging(true);
        updateSeek(e.clientX);
        const move = (ev) => updateSeek(ev.clientX);
        const up = () => { setIsDragging(false); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };

    const formatTime = (t) => { if (!t) return "0:00"; const m = Math.floor(t / 60); const s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; };
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <footer className="fixed bottom-0 left-0 w-full h-20 bg-neutral-900 border-t border-neutral-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] select-none">
            <audio ref={audioRef} src={audioUrl} onPlay={onPlay} onPause={onPause} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={onEnded} />

            <div className="max-w-[1400px] h-full mx-auto px-4 flex items-center justify-between">
                {/* INFO */}
                <div className="flex items-center gap-4 w-1/4">
                    <div className={`w-14 h-14 rounded-md shrink-0 relative overflow-hidden shadow-lg border border-white/10 ${isPlaying ? 'animate-pulse-slow' : ''}`}>
                        {cover ? <img src={cover} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Music size={24} className="text-neutral-500"/></div>}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-white">{t(currentSong) || currentSong}</p>
                        <p className="text-xs text-neutral-400 truncate">{artist}</p>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="flex flex-col items-center justify-center w-2/4">
                    <div className="flex gap-6 mb-1 text-neutral-300">
                        <button onClick={onPrev} className='hover:text-white p-1'><SkipBack size={20}/></button>
                        <button onClick={togglePlay} className='hover:text-green-500 text-3xl p-1 transform active:scale-95'>{isPlaying ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor"/>}</button>
                        <button onClick={onNext} className='hover:text-white p-1'><SkipForward size={20}/></button>
                    </div>
                    <div className="relative w-full h-4 flex items-center group">
                        <span className="text-xs text-neutral-400 mr-2 min-w-[35px] text-right">{formatTime(currentTime)}</span>
                        <div ref={progressRef} onMouseDown={handleSeekDown} className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer relative group-hover:h-1.5 transition-all">
                            <div className="h-full bg-green-500 rounded-full relative" style={{width: `${progressPercent}%`}}>
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"></div>
                            </div>
                        </div>
                        <span className="text-xs text-neutral-400 ml-2 min-w-[35px]">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* VOLUME (Giữ nguyên) */}
                <div className="flex items-center justify-end gap-3 w-1/4 text-neutral-400">
                    <Volume2 size={18}/>
                </div>
            </div>
        </footer>
    );
}