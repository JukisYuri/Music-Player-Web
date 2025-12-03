import { CheckCircle2 } from 'lucide-react';

export function ProfileListSong() {
    return (
        <div className="flex flex-col mx-8 mt-4 gap-2">
        <div className="group grid grid-cols-[20px_1fr_40px_50px] md:grid-cols-[20px_1fr_1fr_40px_50px] gap-4 items-center p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
            <span className="text-gray-400 group-hover:text-white text-base text-right">1</span>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">Img</div>
                <div>
                    <div className="text-white font-medium hover:underline truncate">Chrono</div>
                    <div className="text-gray-400 text-xs hover:text-white hover:underline transition">Kirara Magic & Yirokos</div>
                </div>
            </div>
            <div className="text-gray-400 text-xs hidden md:block hover:text-white hover:underline">PlayList1</div>
            <div className="flex justify-end"><CheckCircle2 size={16} className="text-[#1ed760]" /></div>
            <div className="text-gray-400 text-sm text-right tabular-nums">4:03</div>
        </div>
    </div>
    )
}