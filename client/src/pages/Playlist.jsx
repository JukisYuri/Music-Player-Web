import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from '../components/sidebar.jsx';
import { PlaylistContent } from '../components/playlist_content.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { PlayerBar } from '../components/player_bar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';
import { AddToPlaylistModal } from '../components/playlist_modal.jsx'; // Import Modal
import { useAuth } from '../context/auth_context.jsx';

export function Playlist() {
    const { id } = useParams();
    const { user } = useAuth();

    // State Modal Logout
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // State Modal Add To Playlist
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);

    // Data State
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlaylistDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `http://127.0.0.1:8000/api/music/playlist/${id}/`;
                if (user && user.id) {
                    url += `?user_id=${user.id}`;
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setPlaylistData(data);
                } else {
                    if (res.status === 403) setError("Playlist này là riêng tư.");
                    else setError("Không tìm thấy Playlist.");
                }
            } catch (err) {
                console.error("Lỗi tải playlist:", err);
                setError("Lỗi kết nối server.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPlaylistDetail();
    }, [id, user]);

    // Hàm mở Modal thêm vào playlist (được gọi từ Component con)
    const handleOpenAddModal = (song) => {
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
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2">
                        <span className="text-xl font-bold text-white">⚠️ Thông báo</span>
                        <p>{error}</p>
                    </div>
                ) : (
                    <PlaylistContent
                        playlist={playlistData}
                        onAddSongToPlaylist={handleOpenAddModal}
                    />
                )}
            </div>

            {/* Các Modal */}
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