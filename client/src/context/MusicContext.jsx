import { createContext, useContext, useState } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState({
        id: null,
        title: "",
        artist: "",
        audioUrl: "",
        cover: ""
    });
    const [playlist, setPlaylist] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const playSong = (song, newPlaylist = null) => {
        setCurrentSong(song);
        setIsPlaying(true);

        if (newPlaylist && Array.isArray(newPlaylist) && newPlaylist.length > 0) {
            setPlaylist(newPlaylist);
        }
        else {
            setPlaylist(prev => {
                const exists = prev.some(s => s.id === song.id);
                return exists ? prev : [...prev, song];
            });
        }

        // Gọi API tăng view
        if (song.id) {
            fetch(`http://127.0.0.1:8000/api/music/view/${song.id}/`, { method: 'POST' }).catch(console.error);
        }
    };

    const handleNext = () => {
        if (playlist.length === 0) return;
        const idx = playlist.findIndex(s => s.id === currentSong.id);
        const nextIdx = (idx + 1) % playlist.length;
        playSong(playlist[nextIdx]); // Chỉ đổi bài, không đổi list
    };

    const handlePrev = () => {
        if (playlist.length === 0) return;
        const idx = playlist.findIndex(s => s.id === currentSong.id);
        const prevIdx = (idx - 1 + playlist.length) % playlist.length;
        playSong(playlist[prevIdx]); // Chỉ đổi bài, không đổi list
    };

    const addToQueue = (song) => {
        const exists = playlist.some(s => s.id === song.id);
        if (!exists) {
            setPlaylist(prev => [...prev, song]);
        }
    };

    const removeFromQueue = (songId) => {
        setPlaylist(prev => prev.filter(s => s.id !== songId));
    };

    return (
        <MusicContext.Provider value={{
            currentSong,
            isPlaying,
            setIsPlaying,
            playlist,
            playSong,
            handleNext,
            handlePrev,
            addToQueue,
            removeFromQueue
        }}>
            {children}
        </MusicContext.Provider>
    );
};