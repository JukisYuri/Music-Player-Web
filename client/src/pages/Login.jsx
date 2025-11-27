import { useState } from 'react';
import { LoginInput } from '../components/login-box';
import { CycleBackground } from '../components/cycle-background';

export function Login() {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Light Orbs (Spotify-like vibe) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-[5px] blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-[5px] blur-[120px] animate-pulse delay-1000"></div>
            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-0 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[10px] shadow-2xl overflow-hidden min-h-[600px]">
            <div className="flex flex-col justify-center items-start gap-6 relative z-20 overflow-hidden">
                {/* Cycle Background Component */}
                <CycleBackground />
                <div className="flex flex-col gap-2 max-w-xs mt-3 ml-8">
                    <div className="flex flex-col gap-0.5 z-10 relative">
                        <h2 className="text-3xl font-['Mulish'] font-bold">Âm Nhạc</h2>
                        <h2 className="text-3xl font-['Mulish'] font-bold text-emerald-300">Không Giới Hạn</h2>
                    </div>
                    <h3 className="text-neutral-400 text-sm max-w-xs leading-relaxed z-10 relative">Khám phá hàng triệu bài hát phù hợp với mọi khoảnh khắc của bạn. Còn chần chờ gì nữa?</h3>
                </div>
            </div>
                <form>
                    <div className='flex flex-col items-start mb-8 mt-12 mx-8'>
                        <h2 className="text-2xl font-bold mb-2">Chào Mừng Trở Lại</h2>
                        <h3 className="text-neutral-400 text-sm">Đăng Nhập để tiếp tục vibe của bạn</h3>
                    </div>
                    <div className='flex flex-col gap-4 mt-4 mb-6'>
                    <LoginInput 
                        showPassword={showPassword} 
                        setShowPassword={setShowPassword} 
                    />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 mx-8">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 checked:bg-green-500 checked:border-green-500 focus:ring-0 focus:ring-offset-0 accent-green-500" />
                            Ghi nhớ đăng nhập
                        </label>
                        <a href="#" className="hover:text-green-400 transition-colors box-decoration-slice">Quên mật khẩu?</a>
                    </div>
                    <button
                        type="submit"
                        className="w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors cursor-pointer"
                    >
                        Đăng Nhập
                    </button>
                    {/* Divider - Flexbox Glassmorphism - 1 kẻ trái và 1 đoạn text và 1 kẻ phải */}
                    <div className="relative mt-5 mb-4 mx-8 flex items-center gap-3">
                        <div className="h-px bg-neutral-800 flex-1"></div>
                        <span className="text-xs uppercase text-neutral-500">
                            Hoặc tiếp tục với
                        </span>
                        <div className="h-px bg-neutral-800 flex-1"></div>
                    </div>
                    <div className="grid gap-3">
                        <button className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-full text-xs font-medium border border-white/5 transition-colors cursor-pointer mx-8">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                            Google
                        </button>
                    </div>
                    <div className="mt-14 text-center text-xs text-neutral-400">
                        Chưa có tài khoản? <a href="#" className="text-white font-medium hover:underline hover:text-green-400 transition-colors">Đăng ký ngay</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function App() {
    return <Login />
}