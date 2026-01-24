import { createContext, useContext, useState } from 'react';
import { useAuth } from "./auth_context.jsx";

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
    const [isShuffle, setIsShuffle] = useState(false); // Trạng thái Shuffle

    const { user } = useAuth();

    const playSong = (song, newPlaylist = null) => {
        setCurrentSong(song);
        setIsPlaying(true);

        if (newPlaylist && Array.isArray(newPlaylist)) {
            setPlaylist(newPlaylist);
        } else {
            setPlaylist(prev => {
                const exists = prev.some(s => s.id === song.id);
                return exists ? prev : [...prev, song];
            });
        }

        // Gọi API tăng view và ghi lịch sử
        if (song.id) {
            const endpoint = (user && user.id)
                ? `http://127.0.0.1:8000/api/music/record-playback/${song.id}/`
                : `http://127.0.0.1:8000/api/music/view/${song.id}/`;

            const body = (user && user.id) ? JSON.stringify({ user_id: user.id }) : null;

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            }).catch(err => console.error("Lỗi record playback:", err));
        }
    };

    const handleNext = () => {
        if (playlist.length === 0) return;

        const currentIdx = playlist.findIndex(s => s.id === currentSong.id);

        // LOGIC MỚI: Loại bài hiện tại ra khỏi queue ngay khi kết thúc
        const newPlaylist = playlist.filter(s => s.id !== currentSong.id);

        if (newPlaylist.length > 0) {
            let nextSong;
            if (isShuffle) {
                // Chọn ngẫu nhiên trong danh sách mới
                const nextIdx = Math.floor(Math.random() * newPlaylist.length);
                nextSong = newPlaylist[nextIdx];
            } else {
                // Bài tiếp theo sẽ chiếm vị trí của bài vừa xóa (currentIdx)
                // Nếu bài vừa xóa là bài cuối cùng, quay lại bài đầu tiên (index 0)
                const nextIdx = currentIdx % newPlaylist.length;
                nextSong = newPlaylist[nextIdx];
            }
            // Phát bài tiếp theo và cập nhật lại playlist đã lọc
            playSong(nextSong, newPlaylist);
        } else {
            // Hết nhạc trong queue thì dọn dẹp state
            setPlaylist([]);
            setCurrentSong({ id: null, title: "", artist: "", audioUrl: "", cover: "" });
            setIsPlaying(false);
        }
    };

    const handlePrev = () => {
        if (playlist.length === 0) return;
        const idx = playlist.findIndex(s => s.id === currentSong.id);
        const prevIdx = (idx - 1 + playlist.length) % playlist.length;
        playSong(playlist[prevIdx]);
    };

    const addToQueue = (song) => {
        const exists = playlist.some(s => s.id === song.id);
        if (!exists) setPlaylist(prev => [...prev, song]);
    };

    const removeFromQueue = (songId) => {
        setPlaylist(prev => prev.filter(s => s.id !== songId));
    };

    return (
        <MusicContext.Provider value={{
            currentSong, isPlaying, setIsPlaying,
            playlist, playSong, handleNext, handlePrev,
            addToQueue, removeFromQueue,
            isShuffle, setIsShuffle
        }}>
            {children}
        </MusicContext.Provider>
    );
};