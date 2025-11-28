import { SoundWaves } from '../components/soundwave.jsx';
import { RegisterInput } from '../components/register_box.jsx';
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth_layout.jsx';

export function Register() {
    
    return (
        <AuthLayout
            visualComponent={<SoundWaves />}
            headline="Giai Điệu Của Bạn"
            highlightedHeadline="Kết Nối Cảm Xúc"
            description="Tận hưởng chất lượng âm thanh chuẩn studio và không gian nghe nhạc không bị làm phiền. Tham gia ngay!"
            formTitle="Gia Nhập Thế Giới Nhạc"
            formSubtitle="Tạo tài khoản để xây dựng playlist và gu âm nhạc riêng ngay hôm nay"
            >       
                <form>
                    <div className='flex flex-col gap-4 mt-4 mb-6'>
                        <RegisterInput />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 mx-8">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 checked:bg-green-500 checked:border-green-500 focus:ring-0 focus:ring-offset-0 accent-green-500" />
                            Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors cursor-pointer"
                    >
                        Đăng Kí
                    </button>
                    <div className="mt-10 mb-4 text-center text-xs text-neutral-400">
                        Đã có tài khoản?{' '}
                        <Link 
                            to="/login" 
                            className="text-white font-medium hover:underline hover:text-green-400 transition-colors">
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </form>
        </AuthLayout>
    )
}