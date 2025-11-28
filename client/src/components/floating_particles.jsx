import { useMemo } from "react";

export function FloatingParticles() {
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            size: Math.random() * 4 + 2 + 'px', 
            duration: Math.random() * 10 + 10 + 's', 
            delay: '-' + Math.random() * 10 + 's',
            opacity: Math.random() * 0.5 + 0.2,
        }));
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <style>
                {`
                @keyframes float-up {
                    0% {
                        transform: translateY(0) translateX(0px);
                        opacity: 0;
                    }
                    10% {
                        opacity: var(--target-opacity);
                    }
                    100% {
                        transform: translateY(-120vh) translateX(20px); 
                        opacity: 0;
                    }
                }
                `}
            </style>

            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        bottom: '0',
                        '--target-opacity': p.opacity, 
                        animationName: 'float-up',
                        animationDuration: p.duration,
                        animationDelay: p.delay,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                    }}
                ></div>
            ))}
            
            <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-black via-transparent to-transparent"></div>
        </div>
    );
}