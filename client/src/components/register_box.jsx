import { KeyRound, CircleUser, AtSign, RotateCcwKey } from 'lucide-react';

export function RegisterInput() {
    return (
        <>
            {/* INPUT EMAIL */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><AtSign  size={16} />Email</label>
                <input 
                    type="text" 
                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-2 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    placeholder="Nhập Email" 
                    required
                />
            </div>
            {/* INPUT USERNAME */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><CircleUser size={16} />Tên Người Dùng</label>
                <input 
                    type="text" 
                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-2 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    placeholder="Nhập Tên Người Dùng" 
                    required
                />
            </div>

            {/* INPUT PASSWORD */}
            {/* relative div bao quanh input và button và absolute top-1/2 -translate-y-1/2 */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><KeyRound size={16}/> Mật Khẩu</label>
                <div className="relative">
                    <input 
                        type="password"
                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                        placeholder="*********" 
                        required
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1.5 mx-8">
                <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><RotateCcwKey size={16}/> Nhập Lại Mật Khẩu</label>
                <div className="relative">
                    <input 
                        type="password"
                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                        placeholder="*********" 
                        required
                    />
                </div>
            </div>
        </>
    )
}