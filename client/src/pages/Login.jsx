import { useState } from 'react';
import { LoginInput } from '../components/login_box';
import { CycleBackground } from '../components/cycle';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth_layout.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/auth_context.jsx';

export function Login() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLoginSubmit = (response) => {
        const { access, user } = response.data;
        login(access, user); // Lưu token vào Context
        console.log("Login success!", response.data);
        navigate('/index');
    };
    
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
          console.log(tokenResponse); 
    
          try {
            // Gửi access_token xuống Django
            const res = await axios.post('http://localhost:8000/api/auth/google/', {
              access_token: tokenResponse.access_token, 
            });
            await login(res.data.access); // Lưu token vào Context
            if (res.data.is_new_user) {
                // Django trả về JWT (access & refresh token)
                console.log("Login success!", res.data);
                navigate('/onboarding')
            } else {
                navigate('/index')
            }
          } catch (error) {
            console.error("Login failed", error);
          }
        },
        onError: error => console.log('Login Failed:', error)
      });
    
    return (
        <AuthLayout
            visualComponent={<CycleBackground />}
            headline={t('login.hero_title')}
            highlightedHeadline={t('login.hero_highlight')}
            description={t('login.hero_desc')}
            formTitle={t('login.title')}
            formSubtitle={t('login.subtitle')}
            >   
                <form onSubmit={handleLoginSubmit}>
                    <div className='flex flex-col gap-4 mt-4 mb-6'>
                    <LoginInput 
                        showPassword={showPassword} 
                        setShowPassword={setShowPassword} 
                    />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 mx-8">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 checked:bg-green-500 checked:border-green-500 focus:ring-0 focus:ring-offset-0 accent-green-500" />
                            {t('login.remember_me')}
                        </label>
                        <Link 
                            to="/forgot-password" 
                            className="hover:text-green-400 transition-colors box-decoration-slice">
                            {t('login.forgot_password')}
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-110 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-[5px] mt-6 mx-8 transition-colors cursor-pointer">
                        {t('login.submit_btn')}
                    </button>
                </form>
                {/* Divider - Flexbox Glassmorphism - 1 kẻ trái và 1 đoạn text và 1 kẻ phải */}
                <div className="relative mt-5 mb-4 mx-8 flex items-center gap-3">
                    <div className="h-px bg-neutral-800 flex-1"></div>
                    <span className="text-xs uppercase text-neutral-500">
                        {t('login.divider_or')}
                    </span>
                    <div className="h-px bg-neutral-800 flex-1"></div>
                </div>
                <div className="grid gap-3">
                    <button onClick={() => handleGoogleLogin()} 
                        className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-full text-xs font-medium border border-white/5 transition-colors cursor-pointer mx-8">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                        Google
                    </button>
                </div>
                <div className="mt-12 mb-4 text-center text-xs text-neutral-400">
                    {t('login.no_account')}{' '}
                    <Link 
                        to="/register" 
                        className="text-white font-medium hover:underline hover:text-green-400 transition-colors">
                        {t('login.register_link')}
                    </Link>
                </div>
        </AuthLayout>
    )
}