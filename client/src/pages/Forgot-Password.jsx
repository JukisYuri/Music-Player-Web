import { ForgotPasswordInput } from '../components/forgotpassword_box.jsx';
import { Link } from 'react-router-dom'
import { FloatingParticles } from '../components/floating_particles.jsx';
import { AuthLayout } from '../components/auth_layout.jsx';
import { useState, useEffect } from 'react';

export function ForgotPassword() {
        const [step, setStep] = useState('form') // 'form' hoặc 'otp'
    
        // Kiểm tra trực tiếp password và confirmPassword
        const [newPassword, setNewPassword] = useState("")
        const [confirmNewPassword, setConfirmNewPassword] = useState("")
        const [timeLeft, setTimeLeft] = useState(0); 
        const [isActive, setIsActive] = useState(false);

        const isMatch = newPassword === confirmNewPassword && newPassword.length > 0
        const isMatchWithoutLength = newPassword === confirmNewPassword

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

    return (
        <AuthLayout
            visualComponent={<FloatingParticles />}
            headline="Lạc Mất Nhịp?"
            highlightedHeadline="Đừng Để Nhạc Tắt"
            description="Chỉ là một nốt trầm trong bản nhạc thôi. Hãy lấy lại mật khẩu để tiếp tục giai điệu của bạn"
            formTitle="Khôi Phục Vibe"
            formSubtitle="Nhập Email đã đăng ký, chúng tôi sẽ gửi lối tắt để bạn quay lại thế giới nhạc"
            >
                <form onSubmit={handleFormSubmit}>
                    <div className='flex flex-col gap-3 mt-4'>
                        <ForgotPasswordInput 
                        step={step}
                        newPassword={newPassword}
                        confirmNewPassword={confirmNewPassword}
                        setNewPassword={setNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        isMatchWithoutLength={isMatchWithoutLength}
                        />
                    </div>
                    {step === 'otp' && (
                        <div className="text-right text-sm mt-4 mx-8">
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
                        {step === 'form' ? 'Xác Thực' : 'Xác Nhận'}
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