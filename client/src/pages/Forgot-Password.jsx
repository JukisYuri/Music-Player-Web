import { ForgotPasswordInput } from '../components/forgotpassword_box.jsx';
import { Link } from 'react-router-dom'
import { FloatingParticles } from '../components/floating_particles.jsx';
import { AuthLayout } from '../components/auth_layout.jsx';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ForgotPassword() {
        const navigate = useNavigate();
        const { t } = useTranslation();
        const [step, setStep] = useState('form') // 'form' hoặc 'otp'

        const [email, setEmail] = useState("");
        // Kiểm tra trực tiếp password và confirmPassword
        const [newPassword, setNewPassword] = useState("")
        const [confirmNewPassword, setConfirmNewPassword] = useState("")
        const [otp, setOtp] = useState("");
        const [timeLeft, setTimeLeft] = useState(0); 
        const [isActive, setIsActive] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

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

          const handleFormSubmit = async (e) => { // Thêm async
            e.preventDefault();
            if (isLoading) return; // Ngăn chặn nhiều lần nhấn
            setIsLoading(true);
            try {
            if (step === 'form') {
                await axios.post('http://localhost:8000/api/forgot-password/', { 
                    email: email, 
                });
                console.log("Đã gửi mã OTP");
                setStep('otp');
                setTimeLeft(60); 
                setIsActive(true);
            } else {
                await axios.post('http://localhost:8000/api/reset-password/', {
                    email: email,
                    password: newPassword,
                    otp: otp,
                });
                alert("Đổi mật khẩu thành công!");
                navigate('/login');
            }
        } catch (error) {
            console.error("Lỗi trong quá trình xử lý:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra";
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    }

        const handleResendOtp = async () => {
            try {
            if (isLoading) return; // Ngăn chặn nhiều lần nhấn
            setIsLoading(true);
            await axios.post('http://localhost:8000/api/forgot-password/', { email: email, });
            setTimeLeft(60);
            setIsActive(true);
            } catch (error) {
                console.error("Lỗi khi gửi lại OTP:", error);
                alert(error.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại");
            } finally {
                setIsLoading(false);
            }
        }

    return (
            <AuthLayout
                visualComponent={<FloatingParticles />}
                headline={t('forgot_password.step1_hero_title')}
                highlightedHeadline={t('forgot_password.step1_hero_highlight')}
                description={t('forgot_password.step1_hero_desc')}
                formTitle={t('forgot_password.step1_title')}
                formSubtitle={t('forgot_password.step1_subtitle')}
                >   
                <form onSubmit={handleFormSubmit}>
                    <div className='flex flex-col gap-3 mt-4'>
                        <ForgotPasswordInput 
                        step={step}
                        email={email}
                        setEmail={setEmail}
                        newPassword={newPassword}
                        confirmNewPassword={confirmNewPassword}
                        setNewPassword={setNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        isMatchWithoutLength={isMatchWithoutLength}
                        otp={otp}
                        setOtp={setOtp}
                        />
                    </div>
                    {step === 'otp' && (
                        <div className="text-right text-sm mt-4 mx-8">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isActive || isLoading}
                                className={`font-medium transition-colors ${
                                    isActive || isLoading 
                                    ? 'text-neutral-500 cursor-not-allowed' 
                                    : 'text-green-500 hover:text-green-400 hover:underline cursor-pointer'
                                }`}
                            >
                                {isLoading ? "Đang gửi..." : isActive ? t('forgot_password.resend_otp_wait', { seconds: timeLeft }) : t('forgot_password.resend_otp')}
                            </button>
                        </div>
                    )}
                    <button
                        disabled={!isMatch || isLoading}
                        type="submit"
                        className={`w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors 
                        ${!isMatch || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {isLoading ? "Đang xử lí" : (step === 'form') ? t('forgot_password.submit_verify') : t('forgot_password.submit_confirm')}
                    </button>
                    <div className="mt-10 mb-4 text-center text-xs text-neutral-400">
                        { step === 'form' ? (
                            <>
                                {t('forgot_password.have_account')}{' '}
                                <Link 
                                    to="/login" 
                                    className="text-white font-medium hover:underline hover:text-green-400 transition-colors">
                                    {t('forgot_password.login_link')}
                                </Link>
                            </>
                        ) : (
                            <>
                            {t('forgot_password.wrong_info')}{' '}
                            <button 
                                type="button"
                                onClick={() => setStep('form')}
                                className="text-white font-medium hover:underline hover:text-green-400 transition-colors cursor-pointer">
                                {t('forgot_password.back_edit')}
                            </button>
                        </>
                        )}
                    </div>
                </form>
        </AuthLayout>
    )
}