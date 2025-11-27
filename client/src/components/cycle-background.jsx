export function CycleBackground() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] opacity-60 pointer-events-none ml-10">
                    {/* Vòng tròn lớn nhất */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 animate-[spin_20s_linear_infinite]"></div>
                    {/* Vòng tròn trung bình */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/10 animate-[spin_15s_linear_infinite_reverse]"></div>
                    {/* Vòng tròn nhỏ hơn */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/20 animate-[spin_10s_linear_infinite]"></div>
                    {/* Vòng tròn tâm điểm */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full border-2 border-white/30 animate-[spin_5s_linear_infinite_reverse] flex items-center justify-center">
                        <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                </div>
    );
}

