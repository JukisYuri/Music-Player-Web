import { useState } from "react";
import { CircleUser, Camera, AtSign, Sparkles, Check, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/auth_context.jsx";
import axios from 'axios';

export function OnBoarding() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const { fetchUser } = useAuth();

    const handleNameChange = (e) => {
        const val = e.target.value;
        setDisplayName(val);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarFile(file)
        }
    };

    const handleOnBoardingSubmit = async (e) => {
        e.preventDefault();

        // 1. Dùng FormData
        const formData = new FormData();
        formData.append('display_name', displayName);
        formData.append('username', username);
        if (avatarFile) {
            formData.append('profile_image_url', avatarFile);
        }
        try {
            const token = localStorage.getItem('token');
            // 2. Gửi request PATCH
            await axios.patch('http://localhost:8000/api/user/update-profile/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            await fetchUser(); // lưu kho
            // 3. Thành công
            navigate('/index');
        } catch (error) {
            console.error("Lỗi:", error);
            // Xử lý hiển thị lỗi nếu trùng username
            if (error.response?.data?.username) {
                alert(error.response.data.username[0]);
            }
        }
    }

    return (
        // Thêm flex-col (mobile) và lg:flex-row (desktop), justify-center, gap-10, p-4 để tránh sát lề
        <div className="relative w-full min-h-screen overflow-y-hidden overflow-x-hidden bg-black flex flex-col lg:flex-row items-center justify-center gap-12 p-6">
            
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            
            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[500px] shrink-0">
                <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
                    
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-['Mulish'] font-bold text-white mb-2 flex items-center justify-center gap-2">
                            {t('onboarding.welcome_title')} <Sparkles className="text-emerald-400" size={24} />
                        </h2>
                        <h4 className="text-neutral-400 text-sm">{t('onboarding.welcome_desc')}</h4>
                    </div>

                    {/* Avatar Upload Section */}
                    <div className="relative group mb-8">
                        <div className={`w-32 h-32 rounded-full border-4 border-neutral-700 overflow-hidden flex items-center justify-center bg-neutral-800`}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <CircleUser size={64} className="text-neutral-600" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-white text-neutral-900 p-2.5 rounded-full cursor-pointer hover:bg-black hover:text-white hover:outline-solid outline-2 transition-colors shadow-lg">
                            <Camera size={18} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>

                    {/* Form Fields */}
                    <div className="w-full flex flex-col gap-4">
                        
                        {/* Input Display Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">{t('onboarding.display_name')}</label>
                            <div className="relative">
                                <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input 
                                    type="text"
                                    value={displayName}
                                    maxLength={16}
                                    minLength={3}
                                    onChange={handleNameChange}
                                    className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                    placeholder="Juki Yuri" 
                                />
                            </div>
                        </div>

                        {/* Input Username */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between ml-1">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t('onboarding.username')}</label>
                            </div>
                            <div className="relative group">
                                <AtSign className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${username ? 'text-emerald-400' : 'text-neutral-500'}`} size={18} />
                                <input 
                                    type="text"
                                    value={username}
                                    maxLength={12}
                                    minLength={4}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                    className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-12 text-emerald-300 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="jukisyuri" />
                                {username.length > 3 && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 bg-emerald-500/10 p-1 rounded-full">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <p className="text-[13px] text-red-500 pl-1">
                                {t('onboarding.warning')}
                        </p>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <button onClick={handleOnBoardingSubmit}
                            disabled={!(username && displayName)}
                            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform duration-200 mt-8 text-neutral-300
                            ${username && displayName
                                ? 'bg-green-600 hover:bg-green-700 cursor-pointer outline-green-700' 
                                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed outline'
                            }`}>
                        {t('onboarding.submit')}
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="relative w-full max-w-[600px] overflow-hidden shrink-0"> 
                <h2 className="text-lg text-emerald-300 mb-2 font-semibold text-center lg:text-left">{t('onboarding.remind_display')}</h2>
                <div className="bg-black/60 backdrop-blur-xl p-8 pb-10 rounded-2xl border-3 border-white/10 shadow-2xl">
                    <div className="flex flex-row gap-10 items-start">
                        
                        {/* 1. AVATAR PREVIEW */}
                        <div className="group relative shrink-0">
                            <div className="w-24 h-24 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-[#1e1e1e] bg-black">
                                <img 
                                    src={avatarPreview || "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"} 
                                    alt="Avatar Preview" 
                                    className="w-full h-full object-cover opacity-100 transition-opacity"
                                />
                            </div>
                        </div>

                        {/* 2. INFO PREVIEW */}
                        <div className="flex flex-col flex-1 mt-2 min-w-0">
                            <div className="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
                                <div className="text-white text-2xl sm:text-4xl font-semibold wrap-break-word w-full sm:w-auto">
                                    {displayName || '...'}
                                </div>
                                
                                <div className="text-white text-xl sm:text-2xl font-light opacity-50 select-none font-sans shrink-0">
                                    {username ? `@${username}` : '@...'}
                                </div>
                            </div>
                            <div className="text-white text-sm sm:text-lg font-normal mt-6 w-full opacity-90 italic leading-relaxed border-b border-transparent wrap-break-word">
                                "{ "A lone soul weaving fate among silent constellations" }"
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}