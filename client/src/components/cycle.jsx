export function CycleBackground() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] opacity-60 pointer-events-none ml-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10 border-t-transparent border-l-transparent animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/20 border-r-transparent border-b-transparent animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-dashed border-white/30 animate-[spin_30s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] flex items-center justify-center">
                <div className="absolute w-full h-full bg-green-500/20 rounded-full animate-ping"></div>
                <div className="w-[50px] h-[50px] rounded-full border-2 border-green-400/50 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
        </div>
    )
}