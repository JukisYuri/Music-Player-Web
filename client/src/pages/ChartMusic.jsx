import { useState, useEffect } from "react";
import { Sidebar } from '../components/sidebar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { useAuth } from '../context/auth_context.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { Trophy, Play, MessageCircle, Headphones, Loader2, Crown, Medal } from 'lucide-react';

export function ChartsMusic() {
    const { user } = useAuth();
    const { playSong } = useMusic();
    const [data, setData] = useState({ top_played: [], top_commented: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('played');

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/music/charts/`)
            .then(res => res.json())
            .then(resData => setData(resData))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const currentList = activeTab === 'played' ? data.top_played : data.top_commented;

    // --- HELPER: Cỡ chữ và Icon nhỏ gọn hơn ---
    const getRankDecoration = (index) => {
        switch(index) {
            case 0: return {
                text: 'text-yellow-400 text-xl font-black italic', // Giảm từ 2xl
                bg: 'bg-yellow-500/5 border-yellow-500/20',
                icon: <Crown size={18} className="text-yellow-400 fill-yellow-400/20" /> // Giảm từ 24
            };
            case 1: return {
                text: 'text-neutral-300 text-lg font-bold italic', // Giảm từ xl
                bg: 'bg-neutral-400/5 border-neutral-400/20',
                icon: <Medal size={16} className="text-neutral-300 fill-neutral-300/20" /> // Giảm từ 22
            };
            case 2: return {
                text: 'text-orange-400 text-base font-bold italic', // Giảm từ lg
                bg: 'bg-orange-500/5 border-orange-500/20',
                icon: <Medal size={14} className="text-orange-400 fill-orange-400/20" /> // Giảm từ 20
            };
            default: return {
                text: 'text-neutral-500 text-sm font-medium',
                bg: 'bg-transparent border-transparent',
                icon: null
            };
        }
    };


    return (
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212] overflow-hidden">
            <HeaderBar username={user?.display_name || "Người dùng"} />
            <div className="col-span-2"><Sidebar /></div>

            <div className="col-span-10 pt-24 px-8 h-full overflow-y-auto custom-scrollbar text-white pb-32">
                {/* Header Section - Đã thu nhỏ title */}
                <div className="flex items-center gap-5 mb-8 bg-gradient-to-r from-green-900/20 to-transparent p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                    <div className="p-4 bg-green-500 rounded-xl shadow-lg relative z-10">
                        <Trophy size={40} className="text-black" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-1 tracking-tight uppercase italic">Bảng Xếp Hạng</h1>
                        <p className="text-neutral-400 text-sm font-medium opacity-80">Những giai điệu thịnh hành nhất</p>
                    </div>
                </div>

                {/* Tabs - Thu hẹp padding và text */}
                <div className="flex gap-3 mb-6 p-1 bg-neutral-900/60 w-fit rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('played')}
                        className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'played' ? 'bg-green-500 text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Headphones size={16} /> TOP LƯỢT NGHE
                    </button>
                    <button
                        onClick={() => setActiveTab('commented')}
                        className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'commented' ? 'bg-green-500 text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <MessageCircle size={16} /> TOP QUAN TÂM
                    </button>
                </div>

                {/* Bảng Danh Sách - Cấu trúc lại grid để gọn hơn */}
                <div className="bg-neutral-900/30 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                        <div className="col-span-1 text-center">Hạng</div>
                        <div className="col-span-6">Bài hát</div>
                        <div className="col-span-3">Nghệ sĩ</div>
                        <div className="col-span-2 text-right">Dữ liệu</div>
                    </div>

                    <div className="flex flex-col">
                        {currentList.map((song, index) => {
                            const rank = getRankDecoration(index);
                            return (
                                <div
                                    key={song.id}
                                    onClick={() => playSong(song, currentList)}
                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center group cursor-pointer border-b border-white/5 last:border-0 transition-all hover:bg-white/5 ${rank.bg}`}
                                >
                                    {/* Rank Column */}
                                    <div className="col-span-1 flex flex-col items-center justify-center">
                                        {rank.icon}
                                        <span className={rank.text}>{index + 1}</span>
                                    </div>

                                    {/* Song Info - Thu nhỏ Thumbnail */}
                                    <div className="col-span-6 flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-lg overflow-hidden relative flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                            <img src={song.cover} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play size={18} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`font-bold truncate text-sm ${index < 3 ? 'text-white' : 'text-neutral-200'}`}>{song.title}</span>
                                        </div>
                                    </div>

                                    {/* Artist */}
                                    <div className="col-span-3 text-neutral-400 font-medium truncate text-xs">
                                        {song.artist}
                                    </div>

                                    {/* Stats */}
                                    <div className="col-span-2 text-right">
                                        <div className={`font-bold text-sm ${index < 3 ? 'text-green-400' : 'text-neutral-400'}`}>
                                            {activeTab === 'played'
                                                ? song.views.toLocaleString()
                                                : (song.comment_count || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[9px] text-neutral-600 uppercase font-bold">
                                            {activeTab === 'played' ? 'Lượt nghe' : 'Bình luận'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}