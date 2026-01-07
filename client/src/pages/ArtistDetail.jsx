import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from '../components/sidebar.jsx';
import { PlaylistContent } from '../components/playlist_content.jsx'; // Tái sử dụng UI Playlist
import { HeaderBar } from '../components/header_bar.jsx';
import { PlayerBar } from '../components/player_bar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';
import { useAuth } from '../context/auth_context.jsx';

export function ArtistDetail() {
    const { id } = useParams(); // Lấy Artist ID
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [artistData, setArtistData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtistDetail = async () => {
            setLoading(true);
            try {
                // Gọi API Artist Detail mới tạo
                const res = await fetch(`http://127.0.0.1:8000/api/music/artist/${id}/`);
                if (res.ok) {
                    const data = await res.json();
                    setArtistData(data); // Data này có cấu trúc y hệt Playlist
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchArtistDetail();
    }, [id]);

    return (
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212] overflow-hidden">
            <HeaderBar onLogoutClick={() => setIsModalOpen(true)} username={user?.display_name || "User"}/>
            <div className="col-span-2"><Sidebar /></div>

            <div className="col-span-10 pt-16 h-full mb-20 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="text-white p-10">Đang tải...</div>
                ) : (
                    // Tái sử dụng PlaylistContent vì cấu trúc dữ liệu tương đồng
                    <PlaylistContent playlist={artistData} />
                )}
            </div>
            
            <PlayerBar />
            <LogoutConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => setIsModalOpen(false)} />
        </div>
    );
}