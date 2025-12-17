import { ForgotPasswordInput } from '../components/forgotpassword_box.jsx';
import { Link } from 'react-router-dom'
import { FloatingParticles } from '../components/floating_particles.jsx';
import { AuthLayout } from '../components/auth_layout.jsx';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function ForgotPassword() {
        const navigate = useNavigate();
        const { t } = useTranslation();
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
                navigate('/login');
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
                                    : 'text-green-500 hover:text-green-400 hover:underline cursor-pointer'
                                }`}
                            >
                                {isActive ? t('forgot_password.resend_otp_wait', { seconds: timeLeft }) : t('forgot_password.resend_otp')}
                            </button>
                        </div>
                    )}
                    <button
                        disabled={!isMatch}
                        type="submit"
                        className={`w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors ${!isMatch ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {step === 'form' ? t('forgot_password.submit_verify') : t('forgot_password.submit_confirm')}
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