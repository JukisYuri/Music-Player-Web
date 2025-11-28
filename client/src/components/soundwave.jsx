export function SoundWaves() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] flex items-center justify-center gap-2 h-64 opacity-50 ml-10">
            {[...Array(8)].map((_, i) => (
                <div 
                    key={i}
                    className="w-4 bg-green-500/40 rounded-full animate-pulse"
                    style={{
                        height: `${Math.random() * 100 + 50}px`, 
                        animationDuration: `${Math.random() * 0.5 + 0.5}s`, 
                        animationDelay: `${Math.random() * 0.5}s`
                    }}
                ></div>
            ))}
        </div>
    );
}