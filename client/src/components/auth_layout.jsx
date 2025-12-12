export function AuthLayout({ 
    visualComponent,    // Component hiệu ứng bên trái (FloatingParticles, CycleBackground...)
    headline,           // Dòng tiêu đề trắng 
    highlightedHeadline,// Dòng tiêu đề màu xanh 
    description,        // Dòng mô tả nhỏ bên trái
    formTitle,          // Tiêu đề form bên phải
    formSubtitle,       // Mô tả form bên phải
    children            // Toàn bộ các phần của từng trang sẽ nằm ở đây
}) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Light Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-[5px] blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-[5px] blur-[120px] animate-pulse delay-1000"></div>
            
            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-0 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[10px] shadow-2xl overflow-hidden min-h-[600px]">
                
                {/* LEFT COLUMN: Visuals & Intro Text */}
                <div className="flex flex-col justify-center items-start gap-6 relative z-20 overflow-hidden">
                    {visualComponent}
                    <div className="flex flex-col gap-2 max-w-xs mt-3 ml-8">
                        <div className="flex flex-col gap-0.5 z-10 relative">
                            <h2 className="text-3xl font-['Mulish', _sans-serif] font-bold">{headline}</h2>
                            <h2 className="text-3xl font-['Mulish', _sans-serif] font-bold text-emerald-300">{highlightedHeadline}</h2>
                        </div>
                        <h3 className="text-neutral-400 text-sm max-w-xs leading-relaxed z-10 relative">
                            {description}
                        </h3>
                    </div>
                </div>

                {/* RIGHT COLUMN: Form Area */}
                <div>
                    <div className='flex flex-col items-start mb-8 mt-12 mx-8'>
                        <h2 className="text-2xl font-bold mb-2">{formTitle}</h2>
                        <h3 className="text-neutral-400 text-sm">{formSubtitle}</h3>
                    </div>
                    
                    {/* Phần nội dung riêng biệt của từng trang sẽ được render tại đây */}
                    {children}
                </div>
            </div>
        </div>
    );
}