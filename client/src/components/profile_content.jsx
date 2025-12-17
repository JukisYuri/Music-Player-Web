import { useState, useEffect } from 'react';
import { PenLine, X, Save, Camera } from 'lucide-react';
import { ProfileListSong } from './profile_listsong';
import { useTranslation } from 'react-i18next';

export function ProfileContent() {
    const { t } = useTranslation();
    // Quản lý dữ liệu Profile (State)
    const [profile, setProfile] = useState({
        name: "Jukis Yuri",
        id: "@jukisyuri", // ID này cố định, không chỉnh sửa
        bio: "A lone soul weaving fate among silent constellations",
        avatar: "https://i.pinimg.com/1200x/dc/31/6f/dc316f9a3d295e829f9f863af6863f24.jpg"
    });

    // State cho Modal và dữ liệu tạm thời
    const [isEditing, setIsEditing] = useState(false); // isEditing = false là đang đóng
    const [tempProfile, setTempProfile] = useState(profile);

    // Hàm mở modal: Copy dữ liệu hiện tại vào dữ liệu tạm
    const handleOpenEdit = () => {
        setTempProfile(profile);
        setIsEditing(true);
    };

    // Cập nhật dữ liệu chính thức và đóng modal
    const handleSave = () => {
        setProfile(tempProfile);
        setIsEditing(false);
    };

    return (
        <div className="relative h-full bg-[#121212] text-white overflow-y-auto custom-scrollbar overflow-x-hidden group">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#7F1D1D]/30 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ef4444]/10 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite_1s]" />
            </div>

            {/* --- MODAL EDIT (POPUP) --- */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                        <div className="bg-linear-to-b from-[#7F1D1D] via-[#451010] to-[#1e1e1e] p-8 pb-10">
                            
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                                <PenLine size={20} /> {t('profile.edit_profile2')}
                            </div>

                           
                            <div className="flex flex-row gap-10 items-start">
                                {/* 1. EDIT AVATAR */}
                                <div className="group relative shrink-0">
                                    <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-[#1e1e1e] bg-black">
                                        <img 
                                            src={tempProfile.avatar || 'https://i.pinimg.com/736x/cb/42/a0/cb42a0d246b02689eb30931e94da76fc.jpg'} 
                                            className="w-full h-full object-cover opacity-100 group-hover:opacity-50 transition-opacity"/>
                                        {/* Overlay Icon Camera */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Camera size={40} className="text-white" />
                                        </div>
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Dán link ảnh vào đây..."
                                        className="absolute -bottom-10 left-0 w-48 text-xs bg-black/50 text-white border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-white transition-all"
                                        value={tempProfile.avatar}
                                        onChange={(e) => setTempProfile({...tempProfile, avatar: e.target.value})}/>
                                        {/* Lưu ý 3 chấm trong tempProfile, giữ nguyên những cái cũ */}
                                </div>

                                {/* 2. EDIT INFO */}
                                <div className="flex flex-col flex-1 mt-2">
                                    <div className="flex flex-row items-baseline gap-3">
                                        <input 
                                            type="text"
                                            maxLength={16}
                                            value={tempProfile.name}
                                            onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                                            className="text-white text-4xl font-semibold bg-transparent border-b border-white/20 focus:border-white outline-none w-auto min-w-[200px] placeholder-white/30 transition-all"
                                        />
                                        <div className="text-white text-2xl font-light opacity-50 select-none">
                                            {profile.id}
                                        </div>
                                    </div>
                                    <textarea 
                                        maxLength={150}
                                        value={tempProfile.bio}
                                        onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                                        className="text-white text-lg font-normal mt-6 w-full bg-transparent border-b border-white/20 focus:border-white outline-none resize-none h-24 placeholder-white/30 leading-relaxed transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="bg-[#1e1e1e] px-8 py-4 flex justify-end gap-3 border-t border-white/5">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-full text-white font-medium hover:bg-white/10 transition-colors cursor-pointer">
                                {t('global.cancel')}
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-8 py-2 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer">
                                <Save size={16} /> {t('global.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* --- MAIN CONTENT (VIEW MODE) --- */}
            <div className="relative z-10">
                <div className="bg-linear-to-b from-[#7F1D1D]/90 via-[#451010]/80 to-[#121212] p-8 pb-6 backdrop-blur-sm">
                    <div className="text-white text-3xl font-bold mb-4">{t('profile.title')}</div>
                    <div className="flex flex-row gap-10">
                        <div className="relative group shrink-0 w-48 h-48 flex items-center justify-center">
                            {/* animate-spin */}
                            <div 
                                className="absolute -inset-3 bg-[conic-gradient(transparent,transparent,#ef4444)] rounded-full animate-spin blur-md opacity-70"
                                style={{ animationDuration: '3s' }}
                            ></div>
                            {/* LỚP NEON SHARP */}
                            <div 
                                className="absolute -inset-1 bg-[conic-gradient(transparent,transparent,#ff0000)] rounded-full animate-spin"
                                style={{ animationDuration: '3s' }} 
                            ></div>
                            {/* ẢNH GỐC */}
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#121212] z-10">
                                <img 
                                    src={profile.avatar} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center gap-2">
                                <div className="text-white text-4xl font-semibold mt-4">{profile.name}</div>
                                <div className="text-white text-2xl font-light mt-6 opacity-80">{profile.id}</div>
                            </div>
                            <div className="text-white text-lg font-normal mt-4 max-w-2xl italic opacity-90">
                                "{profile.bio}"
                            </div>
                            <div className="mt-6 flex flex-row items-center gap-4">
                                <button 
                                    onClick={handleOpenEdit}
                                    className="cursor-pointer flex items-center gap-2 bg-white/10 border border-white/20 hover:border-white text-white text-sm font-bold tracking-widest uppercase py-2 px-6 rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 backdrop-blur-md"
                                >
                                    <PenLine size={16} />
                                    {t('profile.edit_profile')}
                                </button>
                                <p className='text-white text-sm font-medium opacity-70'>0 {t('profile.followers')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-8 ml-8'>
                    <p className='text-white text-2xl font-bold'>{t('profile.listened_songs')}</p>
                    <p className='text-neutral-400 text-base font-normal mt-2'>{t('profile.visible_for_you')}</p>
                </div>

                <div className="flex flex-col mx-2 mt-4 gap-2">
                    <ProfileListSong />
                </div>

                <div className='mt-8 mx-8 flex flex-col gap-2 pb-10'>
                    <div className='flex flex-row gap-3 items-baseline'>
                        <p className='text-white text-2xl font-bold'>{t('profile.following')}</p>
                        <p className='text-neutral-400 text-base font-normal'>0 {t('profile.followed')}</p>
                    </div>
                    <p className='text-neutral-500 text-sm font-normal'>{t('profile.no_followed')}</p>
                </div>
            </div>
        </div>
    )
}