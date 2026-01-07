import { SoundWaves } from '../components/soundwave.jsx';
import { RegisterInput } from '../components/register_box.jsx';
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth_layout.jsx';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/auth_context.jsx';

export function Register() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const [step, setStep] = useState('form') // 'form' hoặc 'otp'
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    // Kiểm tra trực tiếp password và confirmPassword
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(0); 
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Thêm trạng thái đồng ý điều khoản
    const [agreeTerms, setAgreeTerms] = useState(false);

    const isMatch = password === confirmPassword && password.length > 0 && agreeTerms
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

    const handleResendOtp = async () => {
        try {
            if (isLoading) return; // Ngăn chặn nhiều lần nhấn
            setIsLoading(true);
            await axios.post('http://localhost:8000/api/resend-otp/', { email: email, });
            setTimeLeft(60);
            setIsActive(true);
            } catch (error) {
                console.error("Lỗi khi gửi lại OTP:", error);
                const msg = error.response?.data?.message || "Có lỗi xảy ra khi gửi lại OTP";
                alert(msg);
            } finally {
                setIsLoading(false);
            }
    }

    const handleFormSubmit = async (e) => { // Thêm async
        e.preventDefault();
        if (isLoading) return; // Ngăn chặn nhiều lần nhấn
        setIsLoading(true);
        try {
            if (step === 'form') {
                // --- GIAI ĐOẠN 1: GỌI API ĐĂNG KÝ ---
                // Chỉ gửi email và pass
                await axios.post('http://localhost:8000/api/register/', { 
                    email: email, 
                    password: password 
                });
                
                // Nếu thành công thì mới chuyển step
                console.log("Đã gửi mã OTP tới:", email);
                setStep('otp');
                setTimeLeft(60); 
                setIsActive(true);
            } else {
                // --- GIAI ĐOẠN 2: GỌI API XÁC THỰC OTP ---
                const res = await axios.post('http://localhost:8000/api/verify-otp/', { 
                    email: email, 
                    otp_code: otp 
                });

                // Lấy token và Login ngay lập tức
                const { access } = res.data.tokens;
                await login(access);

                alert("Đăng ký thành công!");
                navigate('/onboarding');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Email sai định dạng hoặc đã có người sử dụng!");
        } finally {
            setIsLoading(false);
        }
    }

    const content = step === 'form' ? {
        headline: t('register.step1_hero_title'),
        highlightedHeadline: t('register.step1_hero_highlight'),
        description: t('register.step1_hero_desc'),
        formTitle: t('register.step1_title'),
        formSubtitle: t('register.step1_subtitle')
    } : {
        headline: t('register.step2_hero_title'),
        highlightedHeadline: t('register.step2_hero_highlight'),
        description: t('register.step2_hero_desc'),
        formTitle: t('register.step2_title'),
        formSubtitle: t('register.step2_subtitle')
    };
    
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
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            confirmPassword={confirmPassword}
                            setPassword={setPassword}
                            setConfirmPassword={setConfirmPassword}
                            isMatchWithoutLength={isMatchWithoutLength}
                            otp={otp}
                            setOtp={setOtp}
                        />
                    </div>
                    <div className={`flex items-center justify-between text-xs text-neutral-400 mx-8 transition-all duration-500 ${step === 'otp' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 checked:bg-green-500 checked:border-green-500 focus:ring-0 focus:ring-offset-0 accent-green-500" 
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}/>
                            {t('register.terms_agree')}
                        </label>
                    </div>
                    {step === 'otp' && (
                        <div className="text-right text-sm mx-8">
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
                                {isLoading ? "Đang gửi..." : isActive 
                                                                ? t('register.resend_otp_wait', { seconds: timeLeft }) 
                                                                : t('register.resend_otp')
                                }
                            </button>
                        </div>
                    )}
                    <button
                        disabled={!isMatch || isLoading}
                        type="submit"
                        className={`w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors 
                        ${!isMatch || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {isLoading ? "Đang xử lí" : (step === 'form') ? t('register.submit_register') : t('register.submit_confirm')}
                    </button>
                    <div className="mt-10 mb-4 text-center text-xs text-neutral-400">
                        { step === 'form' ? (
                            <>
                                {t('register.have_account')}{' '}
                                <Link 
                                    to="/login" 
                                    className="text-white font-medium hover:underline hover:text-green-400 transition-colors">
                                    {t('register.login_link')}
                                </Link>
                            </>
                        ) : (
                            <>
                            {t('register.wrong_info')}{' '}
                            <button 
                                type="button"
                                onClick={() => setStep('form')}
                                className="text-white font-medium hover:underline hover:text-green-400 transition-colors cursor-pointer">
                                {t('register.back_edit')}
                            </button>
                        </>
                        )}
                    </div>
                </form>
        </AuthLayout>
    )
}