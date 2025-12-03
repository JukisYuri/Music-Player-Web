import React, { useState, useRef} from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Volume1, VolumeX } from 'lucide-react';
import { SoundWaves } from './soundwave.jsx';

/**
 * Thanh điều khiển nhạc
 * @param currentSong - bài hát hiện tại
 * @param artist - tác giả
 * @param audioUrl - đường dẫn bài hát
 */
export function PlayerBar({
    currentSong = "Head In The Clouds",
    artist = "Hayd",
    audioUrl = ""
}) {
    const [isPlaying, setIsPlaying] = useState(false); //Trạng thái phát(bật, tắt)
    const [currentTime, setCurrentTime] = useState(0); //thời gian hiện tại
    const [duration, setDuration] = useState(0); // thời lượng bài hát
    const [volume, setVolume] = useState(1);    //âm lượng
    const [isDragging, setIsDragging] = useState(false);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const volumeRef = useRef(null);

    const formatTime = (timeInSeconds) => { //Format thời gian
        if (!timeInSeconds) return "0:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Bật/Tắt nhạc
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    //Cập nhật thời gian khi nhạc chạy
    const handleTimeUpdate = () => {
        if (audioRef.current && !isDragging) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    //độ dài bài hát
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    //dừng khi hết nhạc
    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Hàm tính toán vị trí chuột và cập nhật thời gian
    const updateSeekPosition = (clientX) => {
        if (!progressRef.current || !audioRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const barWidth = rect.width;

        let progressPercent = offsetX / barWidth;
        progressPercent = Math.max(0, Math.min(1, progressPercent));

        const newTime = progressPercent * duration;
        setCurrentTime(newTime);
        audioRef.current.currentTime = newTime;
    };

    const handleSeekMouseDown = (e) => {
        setIsDragging(true);
        updateSeekPosition(e.clientX);

        const handleMouseMove = (moveEvent) => {
            updateSeekPosition(moveEvent.clientX);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const updateVolumePosition = (clientX) => {
        if (!volumeRef.current || !audioRef.current) return;

        const rect = volumeRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const barWidth = rect.width;

        let newVolume = offsetX / barWidth;
        newVolume = Math.max(0, Math.min(1, newVolume));

        audioRef.current.volume = newVolume;
        setVolume(newVolume);
    };

    const handleVolumeMouseDown = (e) => {
        updateVolumePosition(e.clientX);

        const handleMouseMove = (moveEvent) => {
            updateVolumePosition(moveEvent.clientX);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    //render icon Volume tùy theo mức độ
    const VolumeIcon = () => {
        if (volume === 0) return <VolumeX size={18} />;
        if (volume < 0.5) return <Volume1 size={18} />;
        return <Volume2 size={18} />;
    };

    const currentProgressPercent = duration ? (currentTime / duration) * 100 : 0;
    const currentVolumePercent = volume * 100;

    return (
        <footer className="fixed bottom-0 left-0 w-full h-20 bg-neutral-900 border-t border-neutral-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] select-none">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <div className="max-w-[1400px] h-full mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-4 w-1/4">
                    <div className="w-12 h-12 bg-green-700 rounded-md flex-shrink-0 relative overflow-hidden group">
                        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-white">{currentSong}</p>
                        <p className="text-xs text-neutral-400 truncate">{artist}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-2/4">
                    <div className="flex gap-6 mb-1 text-neutral-300">
                        <button className='hover:text-white transition-colors p-1'>
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className='hover:text-green-500 transition-colors text-3xl p-1 transform active:scale-95'
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                        </button>

                        <button className='hover:text-white transition-colors p-1'>
                            <SkipForward size={20} />
                        </button>
                    </div>

                    <div className="relative w-full h-4 flex items-center group">
                        <span className="text-xs text-neutral-400 mr-2 min-w-[35px] text-right">
                            {formatTime(currentTime)}
                        </span>

                        <div
                            ref={progressRef}
                            onMouseDown={handleSeekMouseDown}
                            className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer relative group-hover:h-1.5 transition-all duration-200"
                        >
                            <div
                                className="h-full bg-green-500 rounded-full relative pointer-events-none"
                                style={{ width: `${currentProgressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <div className='absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden'>
                                <SoundWaves />
                            </div>
                        </div>

                        <span className="text-xs text-neutral-400 ml-2 min-w-[35px]">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 w-1/4 text-neutral-400">
                    <button onClick={() => {
                        if(volume > 0) {
                            audioRef.current.volume = 0;
                            setVolume(0);
                        } else {
                            audioRef.current.volume = 0.5;
                            setVolume(0.5);
                        }
                    }} className='hover:text-white cursor-pointer transition-colors'>
                        <VolumeIcon />
                    </button>

                    <div
                        ref={volumeRef}
                        onMouseDown={handleVolumeMouseDown}
                        className='w-24 h-1 bg-neutral-700 rounded-full cursor-pointer relative group hover:h-1.5 transition-all'
                    >
                        <div
                            className="h-full bg-neutral-300 group-hover:bg-green-500 rounded-full relative transition-colors pointer-events-none"
                            style={{ width: `${currentVolumePercent}%` }}
                        >
                             <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>

                    <Maximize2 size={18} className='hover:text-white cursor-pointer transition-colors ml-2'/>
                </div>
            </div>
        </footer>
    );
}