import { useState, useEffect } from "react";
import { Sidebar } from '../components/sidebar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { useAuth } from '../context/auth_context.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { Sparkles, History, Music2, Mic2, Play, Loader2, X, ChevronRight } from 'lucide-react';

export function DiscoveryMusic() {
    const { user } = useAuth(); // Lấy thông tin người dùng
    const { playSong } = useMusic(); // Lấy hàm phát nhạc
    const [data, setData] = useState({ recently_played: [], genres_grouped: [], artists_grouped: [] });
    const [loading, setLoading] = useState(true);

    const [modalData, setModalData] = useState({ isOpen: false, title: "", songs: [] });

    useEffect(() => {
        const fetchDiscovery = async () => {
            if (!user) return;
            try {
                // Gọi API khám phá âm nhạc
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

    // --- COMPONENT CON: THẺ BÀI HÁT CAO CẤP ---
    const SongCard = ({ song }) => (
        <div
            className="group relative bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer w-48 shrink-0 border border-white/5 hover:border-white/10 shadow-xl"
        >
            <div className="aspect-square rounded-xl overflow-hidden mb-4 relative bg-neutral-800 shadow-inner">
                <img
                    src={song.cover}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={song.title}
                />
                {/* Overlay Play Button với hiệu ứng Glow */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                        onClick={(e) => { e.stopPropagation(); playSong(song); }}
                        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-95"
                    >
                        <Play fill="black" size={28} className="ml-1" />
                    </button>
                </div>
            </div>
            <h3 className="font-bold truncate text-white text-base group-hover:text-green-400 transition-colors">{song.title}</h3>
            <p className="text-sm text-neutral-400 truncate mt-1">{song.artist}</p>
        </div>
    );

    const HorizontalSection = ({ title, icon: Icon, songs, gradient }) => (
        <div className="mb-14 relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
                </div>
                <button
                    onClick={() => setModalData({ isOpen: true, title: title, songs: songs })}
                    className="flex items-center gap-1 text-sm font-bold text-neutral-400 hover:text-green-400 transition-colors group"
                >
                    XEM TẤT CẢ <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            {/* Thanh cuộn mượt mà với hiệu ứng Fade ở 2 đầu */}
            <div className="relative">
                <div className="flex flex-nowrap gap-8 overflow-x-auto pb-6 px-2 custom-scrollbar scroll-smooth">
                    {songs?.map(song => <SongCard key={song.id} song={song} />)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-screen h-screen grid grid-cols-12 bg-[#0a0a0a] overflow-hidden text-white selection:bg-green-500/30">
            {/* Gradient Nền (Mesh Effect) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
            </div>

            <HeaderBar username={user?.display_name || "Oleny"} />
            <div className="col-span-2 relative z-10"><Sidebar /></div>

            <div className="col-span-10 pt-28 px-12 h-full overflow-y-auto custom-scrollbar relative z-10 pb-40">
                {/* Hero Banner Section */}
                <div className="mb-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-neutral-900 to-neutral-800 p-12 border border-white/5 shadow-2xl">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4 text-green-400 font-bold tracking-widest text-sm">
                            <Sparkles size={18} /> KHÁM PHÁ MỖI NGÀY
                        </div>
                        <h1 className="text-6xl font-black mb-6 leading-tight">Giai điệu dành riêng cho bạn</h1>
                        <p className="text-lg text-neutral-400 leading-relaxed">
                            Dựa trên gu âm nhạc của bạn, chúng tôi đã chuẩn bị những bài hát phù hợp nhất cho khoảnh khắc này.
                        </p>
                    </div>
                    {/* Decorative Element */}
                    <div className="absolute right-[-5%] top-[-20%] w-96 h-96 bg-green-500/20 blur-[80px] rounded-full animate-pulse" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="animate-spin text-green-500" size={48} />
                        <p className="text-neutral-500 font-medium">Đang chuẩn bị âm nhạc...</p>
                    </div>
                ) : (
                    <>
                        {data?.recently_played?.length > 0 && (
                            <HorizontalSection
                                title="Vừa nghe gần đây"
                                icon={History}
                                songs={data.recently_played}
                                gradient="from-blue-500 to-indigo-600"
                            />
                        )}

                        {data?.genres_grouped?.map(group => (
                            <HorizontalSection
                                key={group.genre_name}
                                title={`Dành cho bạn: ${group.genre_name}`}
                                icon={Music2}
                                songs={group.songs}
                                gradient="from-green-500 to-teal-600"
                            />
                        ))}

                        {data?.artists_grouped?.map(group => (
                            <HorizontalSection
                                key={group.artist_name}
                                title={`Thêm từ ${group.artist_name}`}
                                icon={Mic2}
                                songs={group.songs}
                                gradient="from-purple-500 to-pink-600"
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Modal xem tất cả (Glassmorphism) */}
            {modalData.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
                    <div className="bg-neutral-900/90 w-full max-w-6xl max-h-[90vh] rounded-[3rem] flex flex-col shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-4xl font-black text-white">{modalData.title}</h2>
                            <button
                                onClick={() => setModalData({ ...modalData, isOpen: false })}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:rotate-90"
                            >
                                <X size={32} className="text-neutral-300" />
                            </button>
                        </div>
                        <div className="p-12 overflow-y-auto custom-scrollbar grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                            {modalData.songs.map(song => <SongCard key={song.id} song={song} />)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}