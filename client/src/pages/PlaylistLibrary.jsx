import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from '../components/sidebar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';
import { useAuth } from '../context/auth_context.jsx';
import { ListMusic, Play, PlusCircle, Loader2, Heart} from 'lucide-react';
import { AddToPlaylistModal } from '../components/playlist_modal.jsx';

export function PlaylistLibrary() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [myPlaylists, setMyPlaylists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {

                const resPlaylist = await fetch(`http://127.0.0.1:8000/api/music/my-playlists/?user_id=${user.id}`);
                if (resPlaylist.ok) {
                    const data = await resPlaylist.json();
                    setMyPlaylists(data);
                }

                const resAlbum = await fetch(`http://127.0.0.1:8000/api/music/top-albums/`);
                if (resAlbum.ok) {
                    const data = await resAlbum.json();
                    setAlbums(data);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handlePlaylistCreated = () => {
        setIsCreateModalOpen(false);
        window.location.reload();
    };

    return (
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212] overflow-hidden">
            <HeaderBar onLogoutClick={() => setIsLogoutModalOpen(true)} username={user?.display_name || "User"}/>
            <div className="col-span-2">
                <Sidebar />
            </div>

            <div className="col-span-10 pt-24 px-8 h-full overflow-y-auto custom-scrollbar text-white pb-32">

                {/* --- PHẦN 1: PLAYLIST CỦA TÔI --- */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ListMusic className="text-green-500" size={32}/>
                        Playlist của tôi
                    </h1>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        <PlusCircle size={20}/> Tạo Playlist mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-green-500"/></div>
                ) : myPlaylists.length === 0 ? (
                    <div className="text-neutral-500 text-center mt-10 text-lg mb-10">Bạn chưa có playlist nào. Hãy tạo mới!</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                        {myPlaylists.map((pl) => (
                            <div
                                key={pl.id}
                                onClick={() => navigate(`/playlist/${pl.id}`)}
                                className="bg-neutral-900/50 p-4 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer group animate-in fade-in zoom-in duration-300"
                            >
                                <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-lg relative bg-neutral-800 border border-white/5">
                                    {pl.cover_image ? (
                                        <img src={pl.cover_image} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900 to-neutral-900">
                                            <ListMusic size={40} className="text-green-500/50"/>
                                        </div>
                                    )}
                                    <div className="absolute right-2 bottom-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <Play size={20} fill="black" className="ml-1 text-black"/>
                                    </div>
                                </div>
                                <h3 className="font-bold truncate text-white">{pl.title}</h3>
                                <p className="text-sm text-neutral-400 truncate">
                                    {pl.song_count || 0} bài hát
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6 border-t border-white/10 pt-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Heart className="text-green-500" size={32}/>
                        Album yêu thích
                    </h1>
                </div>
            </div>

            <LogoutConfirmModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={() => setIsLogoutModalOpen(false)} />
            <AddToPlaylistModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                song={null} 
                onConfirm={handlePlaylistCreated} 
            />
        </div>
    );
}