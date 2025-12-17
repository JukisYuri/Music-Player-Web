import { ArrowLeft, Clock } from "lucide-react";
import { Play } from "lucide-react";
import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AlbumDetailView({ album }) {
    const { t } = useTranslation();
    const dummyTracks = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        title: `Bài hát Demo ${i + 1}`,
        artist: "Nghệ sĩ Demo",
        album: album.title,
        duration: "3:45"
    }));

    return (
        <div className="flex gap-8 h-full items-start">
            <div className="w-[350px] shrink-0 flex flex-col sticky top-0">
                <div className={`aspect-square w-full rounded-xl shadow-2xl bg-linear-to-br ${album.color} flex items-center justify-center mb-6`}>
                    <Music size={80} className="text-white/50"/>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{album.title}</h2>
                <p className="text-neutral-400 text-sm mb-">Được tạo cho Oleny • {dummyTracks.length} bài hát</p>
                
                <div className="flex flex-col gap-3 mt-4">
                    <button className="w-full py-3 bg-green-600 text-white font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer">
                        <Play size={20} fill="currentColor"/> Phát ngay
                    </button>
                </div>
            </div>
            
            <div className="flex-1 bg-neutral-900/30 rounded-xl border border-white/5 overflow-hidden h-full flex flex-col">
                 <div className="px-6 py-4 border-b border-white/5 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10 grid grid-cols-[50px_1fr_355px_35px] text-neutral-400 text-sm font-medium">
                    <div>{t('home_page.number')}</div>
                    <div>{t('home_page.title_music')}</div>
                    <div className="hidden md:block">Album</div>
                    <div className="text-right"><Clock size={16} /></div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                    {dummyTracks.map((track, index) => (
                        <div key={track.id} className="group grid grid-cols-[50px_1fr_1fr_60px] items-center px-4 py-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border-b border-transparent">
                            <div className="text-neutral-400 group-hover:text-white relative">
                                <span className="group-hover:invisible font-variant-numeric tabular-nums">{index + 1}</span>
                                <Play size={14} className="absolute top-1/2 left-0 -translate-y-1/2 hidden group-hover:block text-green-500 fill-current"/>
                            </div>
                            <div className="pr-4">
                                <div className="text-white font-medium truncate">{track.title}</div>
                                <div className="text-neutral-500 text-xs group-hover:text-neutral-400">{track.artist}</div>
                            </div>
                            <div className="text-neutral-500 text-sm hidden md:block truncate pr-4">{track.album}</div>
                            <div className="text-neutral-400 text-sm text-right font-variant-numeric tabular-nums">{track.duration}</div>
                        </div>
                    ))}
                    <div className="h-20"></div>
                </div>
            </div>
        </div>
    );
}