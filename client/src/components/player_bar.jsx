import {useState, useRef, useEffect} from 'react';
import {Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Volume1, VolumeX, Music} from 'lucide-react';
import {SoundWaves} from './soundwave.jsx';

export function PlayerBar({
                              currentSong = "Vui lòng chọn bài hát",
                              artist = "...",
                              audioUrl = "",
                              cover = ""
                          }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const volumeRef = useRef(null);

    useEffect(() => {
        if (audioUrl && audioRef.current) {
            setIsPlaying(true);
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(e => setIsPlaying(false));
            }
        } else {
            setIsPlaying(false);
        }
    }, [audioUrl]);


    const formatTime = (time) => {
        if (!time) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };


    const handleTimeUpdate = () => {
        if (audioRef.current && !isDragging) setCurrentTime(audioRef.current.currentTime);
    };
    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };
    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Seek Logic
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
        const up = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    };

    // Volume Logic
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
        const up = () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    };

    const currentProgressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <footer
            className="fixed bottom-0 left-0 w-full h-20 bg-neutral-900 border-t border-neutral-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] select-none">
            <audio ref={audioRef} src={audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata}
                   onEnded={handleEnded}/>

            <div className="max-w-[1400px] h-full mx-auto px-4 flex items-center justify-between">

                <div className="flex items-center gap-4 w-1/4">
                    <div
                        className={`w-14 h-14 rounded-md flex-shrink-0 relative overflow-hidden shadow-lg border border-white/10 ${isPlaying ? 'animate-pulse-slow' : ''}`}>
                        {cover ? (
                            <img
                                src={cover}
                                alt={currentSong}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                                <Music size={24} className="text-neutral-500"/>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-white hover:underline cursor-pointer">{currentSong}</p>
                        <p className="text-xs text-neutral-400 truncate hover:text-white cursor-pointer transition-colors">{artist}</p>
                    </div>
                </div>

                {/* 2. CONTROLS */}
                <div className="flex flex-col items-center justify-center w-2/4">
                    <div className="flex gap-6 mb-1 text-neutral-300">
                        <button className='hover:text-white transition-colors p-1'><SkipBack size={20}/></button>
                        <button onClick={togglePlay}
                                className='hover:text-green-500 transition-colors text-3xl p-1 transform active:scale-95'>
                            {isPlaying ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor"/>}
                        </button>
                        <button className='hover:text-white transition-colors p-1'><SkipForward size={20}/></button>
                    </div>

                    <div className="relative w-full h-4 flex items-center group">
                        <span
                            className="text-xs text-neutral-400 mr-2 min-w-[35px] text-right">{formatTime(currentTime)}</span>
                        <div ref={progressRef} onMouseDown={handleSeekDown}
                             className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer relative group-hover:h-1.5 transition-all duration-200">
                            <div className="h-full bg-green-500 rounded-full relative pointer-events-none"
                                 style={{width: `${currentProgressPercent}%`}}>
                                <div
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div
                                className={`absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden ${!isPlaying && 'hidden'}`}>
                                <SoundWaves/>
                            </div>
                        </div>
                        <span className="text-xs text-neutral-400 ml-2 min-w-[35px]">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 w-1/4 text-neutral-400">
                    <button onClick={() => {
                        audioRef.current.volume = volume > 0 ? 0 : 0.5;
                        setVolume(volume > 0 ? 0 : 0.5);
                    }} className='hover:text-white cursor-pointer'>
                        {volume === 0 ? <VolumeX size={18}/> : volume < 0.5 ? <Volume1 size={18}/> :
                            <Volume2 size={18}/>}
                    </button>
                    <div ref={volumeRef} onMouseDown={handleVolDown}
                         className='w-24 h-1 bg-neutral-700 rounded-full cursor-pointer relative group hover:h-1.5 transition-all'>
                        <div
                            className="h-full bg-neutral-300 group-hover:bg-green-500 rounded-full relative pointer-events-none"
                            style={{width: `${volume * 100}%`}}>
                            <div
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <Maximize2 size={18} className='hover:text-white cursor-pointer ml-2'/>
                </div>
            </div>
        </footer>
    );
}