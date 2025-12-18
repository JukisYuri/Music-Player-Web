import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Volume1, VolumeX, Music, Heart, PlusCircle, X } from 'lucide-react';
import { SoundWaves } from './soundwave.jsx';
import { useTranslation } from 'react-i18next';

export function PlayerBar({
    currentSong = 'player_bar.current_song',
    artist = "...",
    audioUrl = "",
    cover = "",
    onNext,
    onPrev,
    onPlayingChange,
    playlist = [],
    onPlaySong
}) {
    const { t } = useTranslation();

    // --- STATES ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false); // State ẩn/hiện Popup

    // --- REFS ---
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const volumeRef = useRef(null);

    // Reset Like khi đổi bài
    useEffect(() => { setIsLiked(false); }, [currentSong]);

    // Báo trạng thái Play/Pause ra ngoài
    const handlePlayStatus = (status) => {
        setIsPlaying(status);
        if (onPlayingChange) onPlayingChange(status);
    };

    // Load & Autoplay khi URL thay đổi
    useEffect(() => {
        if (audioRef.current) {
            if (audioUrl) {
                setCurrentTime(0);
                audioRef.current.load();
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => handlePlayStatus(true))
                        .catch(error => {
                            console.log("Autoplay blocked:", error);
                            handlePlayStatus(false);
                        });
                }
            } else {
                audioRef.current.pause();
                handlePlayStatus(false);
            }
        }
    }, [audioUrl]);

    // --- AUDIO EVENTS ---
    const onAudioPlay = () => handlePlayStatus(true);
    const onAudioPause = () => handlePlayStatus(false);
    const onAudioEnded = () => {
        handlePlayStatus(false);
        setCurrentTime(0);
        if (onNext) onNext();
    };
    const onAudioTimeUpdate = () => {
        if (audioRef.current && !isDragging) setCurrentTime(audioRef.current.currentTime);
    };
    const onAudioLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    // Toggle Play/Pause
    const togglePlay = () => {
        if (!audioRef.current) return;
        audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
    };

    // --- SEEK LOGIC ---
    const updateSeek = (clientX) => {
        if (!progressRef.current || !audioRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newTime = percent * duration;
        setCurrentTime(newTime);
        audioRef.current.currentTime = newTime;
    };
    const handleSeekDown = (e) => {
        setIsDragging(true);
        updateSeek(e.clientX);
        const move = (ev) => updateSeek(ev.clientX);
        const up = () => { setIsDragging(false); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };

    // --- VOLUME LOGIC ---
    const updateVol = (clientX) => {
        if (!volumeRef.current || !audioRef.current) return;
        const rect = volumeRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audioRef.current.volume = percent;
        setVolume(percent);
    };
    const handleVolDown = (e) => {
        updateVol(e.clientX);
        const move = (ev) => updateVol(ev.clientX);
        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };

    const formatTime = (t) => { if (!t || isNaN(t)) return "0:00"; const m = Math.floor(t / 60); const s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; };
    const currentProgressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <footer className="fixed bottom-0 left-0 w-full h-20 bg-neutral-900 border-t border-neutral-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] select-none">

            {/* === POPUP PLAYLIST === */}
            {showPlaylist && (
                <div className="absolute bottom-24 right-4 w-80 md:w-96 max-h-[60vh] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-[60]">
                    {/* Header Popup */}
                    <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/95 backdrop-blur sticky top-0 z-10">
                        <h3 className="font-bold text-white text-lg">Danh sách phát</h3>
                        <button onClick={() => setShowPlaylist(false)} className="text-neutral-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* List Songs */}
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                        {playlist.length === 0 ? (
                            <div className="text-neutral-500 text-center py-10 text-sm">Danh sách trống</div>
                        ) : (
                            playlist.map((song, index) => {
                                const isActive = currentSong === song.title;
                                return (
                                    <div
                                        key={index}
                                        onClick={() => onPlaySong && onPlaySong(song)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-neutral-800'}`}
                                    >
                                        <div className="w-10 h-10 rounded overflow-hidden shrink-0 relative">
                                            {song.cover ? (
                                                <img src={song.cover} className="w-full h-full object-cover opacity-80" />
                                            ) : (
                                                <div className="bg-neutral-700 w-full h-full flex items-center justify-center"><Music size={14}/></div>
                                            )}
                                            {isActive && isPlaying && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <SoundWaves />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                                            <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* === AUDIO TAG === */}
            <audio ref={audioRef} src={audioUrl} onPlay={onAudioPlay} onPause={onAudioPause} onTimeUpdate={onAudioTimeUpdate} onLoadedMetadata={onAudioLoadedMetadata} onEnded={onAudioEnded} />

            {/* === MAIN BAR === */}
            <div className="max-w-[1400px] h-full mx-auto px-4 flex items-center justify-between gap-4">

                {/* 1. INFO*/}
                <div className="flex items-center gap-3 w-[30%] min-w-0">
                    <div className={`w-14 h-14 rounded-md shrink-0 relative overflow-hidden shadow-lg border border-white/10 ${isPlaying ? 'animate-pulse-slow' : ''}`}>
                        {cover ? <img src={cover} alt={currentSong} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Music size={24} className="text-neutral-500"/></div>}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-semibold truncate text-white hover:underline cursor-pointer">{t(currentSong) || currentSong}</p>
                        <p className="text-xs text-neutral-400 truncate hover:text-white cursor-pointer">{artist}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setIsLiked(!isLiked)} className={`hover:scale-110 transition-transform ${isLiked ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}>
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => alert("Đã thêm vào playlist!")} className="text-neutral-400 hover:text-white hover:scale-110 transition-transform">
                            <PlusCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* 2. CONTROLS*/}
                <div className="flex flex-col items-center justify-center w-[40%] max-w-2xl">
                    <div className="flex gap-6 mb-1 text-neutral-300 items-center">
                        <button onClick={onPrev} className='hover:text-white transition-colors p-1'><SkipBack size={20}/></button>
                        <button onClick={togglePlay} className='hover:text-green-500 transition-colors text-3xl p-1 transform active:scale-105'>
                            {isPlaying ? <Pause size={25} fill="currentColor" className="ml-0.5"/> : <Play size={25} fill="currentColor" className="ml-0.5"/>}
                        </button>
                        <button onClick={onNext} className='hover:text-white transition-colors p-1'><SkipForward size={20}/></button>
                    </div>
                    <div className="relative w-full h-4 flex items-center group gap-2">
                        <span className="text-xs text-neutral-400 min-w-[35px] text-right">{formatTime(currentTime)}</span>
                        <div ref={progressRef} onMouseDown={handleSeekDown} className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer relative group-hover:h-1.5 transition-all duration-200">
                            <div className="h-full bg-green-500 rounded-full relative pointer-events-none" style={{width: `${currentProgressPercent}%`}}>
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className={`absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden ${!isPlaying && 'hidden'}`}>
                                <SoundWaves/>
                            </div>
                        </div>
                        <span className="text-xs text-neutral-400 min-w-[35px]">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* 3. VOLUME & PLAYLIST (RIGHT - 30%) */}
                <div className="flex items-center justify-end gap-3 w-[30%] text-neutral-400">
                    <button onClick={() => {
                        const newVol = volume > 0 ? 0 : 0.5;
                        audioRef.current.volume = newVol;
                        setVolume(newVol);
                    }} className='hover:text-white cursor-pointer'>
                        {volume === 0 ? <VolumeX size={20}/> : volume < 0.5 ? <Volume1 size={20}/> : <Volume2 size={20}/>}
                    </button>

                    <div ref={volumeRef} onMouseDown={handleVolDown} className='w-24 h-1 bg-neutral-700 rounded-full cursor-pointer relative group hover:h-1.5 transition-all'>
                        <div className="h-full bg-neutral-300 group-hover:bg-green-500 rounded-full relative pointer-events-none" style={{width: `${volume * 100}%`}}>
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>

                    {/* NÚT PLAYLIST */}
                    <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className={`ml-2 hover:text-white cursor-pointer transition-colors ${showPlaylist ? 'text-green-500' : ''}`}
                        title="Danh sách phát"
                    >
                        <ListMusic size={20}/>
                    </button>
                </div>
            </div>
        </footer>
    );
}