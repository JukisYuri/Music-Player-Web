import { useState, useEffect } from "react";
import { Sidebar } from '../components/sidebar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { useAuth } from '../context/auth_context.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { Sparkles, History, Music2, Mic2, Play, Loader2, X } from 'lucide-react';

export function DiscoveryMusic() {
    const { user } = useAuth();
    const { playSong } = useMusic();
    const [data, setData] = useState({ recently_played: [], genres_grouped: [], artists_grouped: [] });
    const [loading, setLoading] = useState(true);

    // State cho Popup
    const [modalData, setModalData] = useState({ isOpen: false, title: "", songs: [] });

    useEffect(() => {
        const fetchDiscovery = async () => {
            if (!user) return;
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/discovery/?user_id=${user.id}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchDiscovery();
    }, [user]);

    // --- COMPONENT CON: THẺ BÀI HÁT ---
    const SongCard = ({ song, isLarge = false }) => (
        <div
            className={`bg-neutral-900/40 p-4 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer group flex-shrink-0 ${isLarge ? 'w-full' : 'w-48'}`}
        >
            <div className="aspect-square rounded-lg overflow-hidden mb-4 relative shadow-lg bg-neutral-800">
                <img src={song.cover} className="w-full h-full object-cover" alt={song.title} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); playSong(song); }}
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                    >
                        <Play fill="black" size={24} className="ml-1" />
                    </button>
                </div>
            </div>
            <h3 className="font-bold truncate text-white text-sm">{song.title}</h3>
            <p className="text-xs text-neutral-400 truncate mt-1">{song.artist}</p>
        </div>
    );

    // --- COMPONENT CON: POPUP XEM TẤT CẢ ---
    const SeeAllModal = () => {
        if (!modalData.isOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-[#181818] w-full max-w-5xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-white/5">
                    {/* Header Modal */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Sparkles className="text-green-500" size={24} />
                            {modalData.title}
                        </h2>
                        <button
                            onClick={() => setModalData({ ...modalData, isOpen: false })}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={28} className="text-neutral-400 hover:text-white" />
                        </button>
                    </div>

                    {/* Danh sách nhạc trong Modal */}
                    <div className="p-8 overflow-y-auto custom-scrollbar grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {modalData.songs.map(song => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const HorizontalSection = ({ title, icon: Icon, songs }) => (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Icon className="text-green-500" size={28} />
                    {title}
                </h2>
                <button
                    onClick={() => setModalData({ isOpen: true, title: title, songs: songs })}
                    className="text-xs font-bold text-neutral-500 hover:text-green-500 uppercase tracking-widest transition-colors"
                >
                    Xem tất cả
                </button>
            </div>
            <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
                {songs?.map(song => <SongCard key={song.id} song={song} />)}
            </div>
        </div>
    );



    return (
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212] overflow-hidden">
            <HeaderBar username={user?.display_name || "Người dùng"} />
            <div className="col-span-2"><Sidebar /></div>
            <div className="col-span-10 pt-24 px-8 h-full overflow-y-auto custom-scrollbar text-white pb-32">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-green-500/10 rounded-2xl">
                        <Sparkles className="text-green-500" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold">Khám phá âm nhạc</h1>
                </div>

                {data?.recently_played?.length > 0 && (
                    <HorizontalSection title="Vừa nghe gần đây" icon={History} songs={data.recently_played} />
                )}

                {data?.genres_grouped?.map(group => (
                    <HorizontalSection
                        key={group.genre_name}
                        title={`Dành cho fan của ${group.genre_name}`}
                        icon={Music2}
                        songs={group.songs}
                    />
                ))}

                {data?.artists_grouped?.map(group => (
                    <HorizontalSection
                        key={group.artist_name}
                        title={`Thêm từ ${group.artist_name}`}
                        icon={Mic2}
                        songs={group.songs}
                    />
                ))}
            </div>

            {/* Popup hiện lên ở đây */}
            <SeeAllModal />
        </div>
    );
}