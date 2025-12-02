import { SoundWaves } from '../components/soundwave.jsx';
import { RegisterInput } from '../components/register_box.jsx';
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth_layout.jsx';
import { useState, useEffect } from 'react';

export function Register() {
    const [step, setStep] = useState('form') // 'form' hoặc 'otp'

    // Kiểm tra trực tiếp password và confirmPassword
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [timeLeft, setTimeLeft] = useState(0); 
    const [isActive, setIsActive] = useState(false);

    const isMatch = password === confirmPassword && password.length > 0
    const isMatchWithoutLength = password === confirmPassword

    useEffect(() => {
        let interval = null;
    
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
        }, [isActive, timeLeft]);
        const handleFormSubmit = (e) => {
        e.preventDefault();
        if (step === 'form') {
            console.log("Đã gửi mã OTP");
            setStep('otp');
            setTimeLeft(60); 
            setIsActive(true);
        } else {
            alert("Đổi mật khẩu thành công!");
        }
    }

    const handleResendOtp = () => {
        console.log("Resending OTP...");
        setTimeLeft(60);
        setIsActive(true);
    }

    const content = step === 'form' ? {
        headline: "Giai Điệu Của Bạn",
        highlightedHeadline: "Kết Nối Cảm Xúc",
        description: "Tận hưởng chất lượng âm thanh chuẩn studio và không gian nghe nhạc không bị làm phiền. Tham gia ngay!",
        formTitle: "Gia Nhập Thế Giới Nhạc",
        formSubtitle: "Tạo tài khoản để xây dựng playlist và gu âm nhạc riêng ngay hôm nay"
    } : {
        headline: "Sắp Hoàn Tất!",
        highlightedHeadline: "Xác Thực Danh Tính",
        description: "Chỉ còn một bước nữa. Hãy kiểm tra hộp thư đến để lấy mã kích hoạt.",
        formTitle: "Nhập Mã Xác Nhận",
        formSubtitle: "Chúng tôi đã gửi mã OTP 6 số đến email của bạn"
    }
    
    return (
        <AuthLayout
            visualComponent={<SoundWaves />}
            headline={content.headline}
            highlightedHeadline={content.highlightedHeadline}
            description={content.description}
            formTitle={content.formTitle}
            formSubtitle={content.formSubtitle}
            >       
                <form onSubmit={handleFormSubmit}>
                    <div className='flex flex-col gap-3 mt-4 mb-6'>
                        <RegisterInput
                            step={step}
                            password={password}
                            confirmPassword={confirmPassword}
                            setPassword={setPassword}
                            setConfirmPassword={setConfirmPassword}
                            isMatchWithoutLength={isMatchWithoutLength}
                        />
                    </div>
                    <div className={`flex items-center justify-between text-xs text-neutral-400 mx-8 transition-all duration-500 ${step === 'otp' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 checked:bg-green-500 checked:border-green-500 focus:ring-0 focus:ring-offset-0 accent-green-500" />
                            Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
                        </label>
                    </div>
                    {step === 'otp' && (
                        <div className="text-right text-sm mx-8">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isActive}
                                className={`font-medium transition-colors ${
                                    isActive 
                                    ? 'text-neutral-500 cursor-not-allowed' 
                                    : 'text-green-500 hover:text-green-400 hover:underline'
                                }`}
                            >
                                {isActive ? `Gửi lại mã sau (${timeLeft}s)` : 'Gửi lại mã xác thực'}
                            </button>
                        </div>
                    )}
                    <button
                        disabled={!isMatch}
                        type="submit"
                        className={`w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors ${!isMatch ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {step === 'form' ? 'Đăng Ký' : 'Xác Nhận'}
                    </button>
                    <div className="mt-10 mb-4 text-center text-xs text-neutral-400">
                        { step === 'form' ? (
                            <>
                                Đã có tài khoản?{' '}
                                <Link 
                                    to="/login" 
                                    className="text-white font-medium hover:underline hover:text-green-400 transition-colors">
                                    Đăng nhập tại đây
                                </Link>
                            </>
                        ) : (
                            <>
                            Nhập sai thông tin?{' '}
                            <button 
                                type="button"
                                onClick={() => setStep('form')}
                                className="text-white font-medium hover:underline hover:text-green-400 transition-colors cursor-pointer">
                                Quay lại chỉnh sửa
                            </button>
                        </>
                        )}
                    </div>
                </form>
        </AuthLayout>
    )
}