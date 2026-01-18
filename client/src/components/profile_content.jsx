import { useState, useRef, useEffect } from 'react';
import { PenLine, X, Save, Camera, UserRoundPen, User, Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/auth_context.jsx';
import { useNavigate, useParams } from 'react-router-dom';

export function ProfileContent() {
    const { t } = useTranslation();
    const { user: authUser, loading: authLoading, fetchUser } = useAuth();
    const { username } = useParams(); // Lấy username từ URL
    
    // State hiển thị profile (có thể là của mình hoặc người khác)
    const [displayUser, setDisplayUser] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const navigate = useNavigate();
    const [followingList, setFollowingList] = useState([]);

    // Logic xác định Profile cần hiển thị
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsProfileLoading(true);
            // Nếu không có username trên URL hoặc username trùng với user đang login -> Là chính mình
            if (!username || (authUser && username === authUser.username)) {
                setDisplayUser(authUser);
                setIsOwnProfile(true);
                setIsProfileLoading(false);
            } else {
                // Nếu là người khác -> Gọi API lấy thông tin Public
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:8000/api/user/profile/${username}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setDisplayUser(res.data);
                    setIsOwnProfile(false);
                } catch (error) {
                    console.error("Lỗi lấy profile user khác:", error);
                    setDisplayUser(null);
                } finally {
                    setIsProfileLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchProfileData();
        }
    }, [username, authUser, authLoading]);

    // Logic lấy danh sách Following (Chỉ chạy khi là Profile của chính mình)
    useEffect(() => {
        const fetchFollowing = async () => {
            if (isOwnProfile && authUser) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('http://localhost:8000/api/user/me/following/', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFollowingList(res.data);
                } catch (error) {
                    console.error("Lỗi lấy danh sách following:", error);
                }
            }
        };
        fetchFollowing();
    }, [isOwnProfile, authUser]);

    // Hàm mở modal Edit (Chỉ dùng cho Owner)
    const handleOpenEdit = () => {
        if (displayUser) {
            setTempProfile({
                display_name: displayUser.display_name || '',
                description: displayUser.description || '',
            });
        }
        setIsEditing(true);
    };

    // Hàm xử lý thay đổi ảnh đại diện trong modal Edit
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setTempProfile({
                ...tempProfile,
                avatar_preview: previewUrl,
                avatar_file: file
            });
        }
    };
    
    const handleTriggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Hàm lưu Profile (Chỉ dùng cho Owner)
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('display_name', tempProfile.display_name);
            formData.append('description', tempProfile.description);
            if (tempProfile.avatar_file) {
                formData.append('profile_image_url', tempProfile.avatar_file); 
            }
            await axios.patch('http://localhost:8000/api/user/update-profile/', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': undefined // Để trình duyệt tự set boundary cho multipart/form-data
                }
            });
            await fetchUser(); // Update context
            setIsEditing(false);
            alert("Cập nhật thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại!");
        }
    };

    // Hàm xử lý Follow/Unfollow (Dùng cho Khách)
    const handleFollowToggle = async () => {
        if (!displayUser) return;
        try {
            const token = localStorage.getItem('token');
            // Gọi API toggle follow
            const res = await axios.post(`http://localhost:8000/api/user/follow/${displayUser.username}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Cập nhật lại state cục bộ để UI thay đổi ngay lập tức
            setDisplayUser(prev => ({
                ...prev,
                is_following: res.data.is_following,
                followers_count: res.data.follower_count
            }));

        } catch (error) {
            console.error("Lỗi follow user:", error);
            alert("Có lỗi xảy ra");
        }
    };

    const getAvatarUrl = (path) => {
        if (!path) return 'https://i.pinimg.com/736x/c5/ae/a6/c5aea65e8537746d6c8af1de3eea04f6.jpg';
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    if (authLoading || isProfileLoading) {
        return <div className="text-white p-10">{t('profile.is_loading')}</div>;
    }

    if (!displayUser) {
        return <div className="text-white p-10 text-2xl font-bold flex gap-2"><UserRoundPen size={32}/>{t('profile.no_user')}</div>;
    }

    return (
        <div className="relative h-full bg-[#121212] text-white overflow-y-auto custom-scrollbar overflow-x-hidden group">
            {/* Background effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#7F1D1D]/30 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ef4444]/10 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite_1s]" />
            </div>

            {/* --- MODAL EDIT (Chỉ render khi là Owner và đang edit) --- */}
            {isEditing && isOwnProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                        <div className="bg-linear-to-b from-[#7F1D1D] via-[#451010] to-[#1e1e1e] p-8 pb-10">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer">
                                <X size={24} />
                            </button>

                            <div className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                                <PenLine size={20} /> {t('profile.edit_profile2')}
                            </div>

                            <div className="flex flex-row gap-10 items-start">
                                <div className="group relative shrink-0">
                                    <div 
                                        onClick={handleTriggerFileSelect}
                                        className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-[#1e1e1e] bg-black cursor-pointer relative"
                                    >
                                        <img 
                                            src={tempProfile.avatar_preview || getAvatarUrl(displayUser.profile_image_url)} 
                                            className="w-full h-full object-cover opacity-100 group-hover:opacity-50 transition-opacity"
                                            alt="Avatar Preview"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Camera size={40} className="text-white" />
                                        </div>
                                    </div>
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <p className="text-xs text-neutral-500 text-center mt-3">
                                        {t('profile.click_to_change')}
                                    </p>
                                </div>

                                <div className="flex flex-col flex-1 mt-2">
                                    <div className="flex flex-row items-baseline gap-3">
                                        <input 
                                            type="text"
                                            maxLength={30}
                                            value={tempProfile.display_name}
                                            onChange={(e) => setTempProfile({...tempProfile, display_name: e.target.value})}
                                            className="text-white text-4xl font-semibold bg-transparent border-b border-white/20 focus:border-white outline-none w-auto min-w-[200px] placeholder-white/30 transition-all"
                                            placeholder="Tên hiển thị"
                                        />
                                        <div className="text-white text-2xl font-light opacity-50 select-none">
                                            @{displayUser.username}
                                        </div>
                                    </div>
                                    <textarea 
                                        maxLength={150}
                                        value={tempProfile.description}
                                        onChange={(e) => setTempProfile({...tempProfile, description: e.target.value})}
                                        className="text-white text-lg font-normal mt-6 w-full bg-transparent border-b border-white/20 focus:border-white outline-none resize-none h-24 placeholder-white/30 leading-relaxed transition-all"
                                        placeholder={t('profile.bio')}
                                    />
                                </div>
                            </div>
                        </div>

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

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10">
                <div className="bg-linear-to-b from-[#7F1D1D]/90 via-[#451010]/80 to-[#121212] p-8 pb-6 backdrop-blur-sm">
                    <div className="text-white text-3xl font-bold mb-4">{t('profile.title')}</div>
                    <div className="flex flex-row gap-10">
                        {/* Avatar Display */}
                        <div className="relative group shrink-0 w-48 h-48 flex items-center justify-center">
                            <div className="absolute -inset-3 bg-[conic-gradient(transparent,transparent,#ef4444)] rounded-full animate-spin blur-md opacity-70" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute -inset-1 bg-[conic-gradient(transparent,transparent,#ff0000)] rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                            
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#121212] z-10">
                                <img 
                                    src={getAvatarUrl(displayUser.profile_image_url)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Info Display */}
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center gap-2">
                                <div className="text-white text-4xl font-semibold mt-4">
                                    {displayUser.display_name || displayUser.username}
                                </div>
                                <div className="text-white text-2xl font-light mt-6 opacity-80">
                                    @{displayUser.username}
                                </div>
                            </div>
                            <div className="text-white text-lg font-normal mt-4 max-w-2xl italic opacity-90">
                                "{displayUser.description || t('profile.no_bio')}"
                            </div>

                            {/* Actions & Stats */}
                            <div className="mt-6 flex flex-row items-center gap-4">
                                {/* Nếu là chính mình -> Nút Edit. Nếu là người khác -> Nút Follow */}
                                {isOwnProfile ? (
                                    <button 
                                        onClick={handleOpenEdit}
                                        className="cursor-pointer flex items-center gap-2 bg-white/10 border border-white/20 hover:border-white text-white text-sm font-bold tracking-widest uppercase py-2 px-6 rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 backdrop-blur-md">
                                        <PenLine size={16} />
                                        {t('profile.edit_profile')}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleFollowToggle}
                                        className={`cursor-pointer flex items-center gap-2 text-sm font-bold tracking-widest uppercase py-2 px-6 rounded-full transition-all duration-300 ease-in-out hover:scale-105 ${
                                            displayUser.is_following 
                                            ? 'bg-transparent border border-white text-white' 
                                            : 'bg-white text-black hover:bg-neutral-200'
                                        }`}>
                                        {displayUser.is_following ? <Check size={16}/> : <Plus size={16}/>}
                                        {displayUser.is_following ? t('search.followed') || 'Đang theo dõi' : t('search.follow') || 'Theo dõi'}
                                    </button>
                                )}
                                
                                <p className='text-white text-sm font-medium opacity-70'>
                                    {displayUser.followers_count || 0} {t('profile.followers')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOLLOWING LIST --- 
                    Chỉ hiển thị khi xem profile của chính mình
                    Vì backend API 'me/following' chỉ trả về danh sách của người đang đăng nhập
                */}
                {isOwnProfile && (
                    <div className='mt-8 mx-8 pb-10'>
                        <div className='flex flex-row gap-3 items-baseline mb-4'>
                            <p className='text-white text-2xl font-bold'>{t('profile.following')}</p>
                            <p className='text-neutral-400 text-base font-normal'>{displayUser.following_count || 0} {t('profile.followed')}</p>
                        </div>
                        {followingList.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-20">
                                {followingList.map((u) => (
                                    <div 
                                        key={u.id} 
                                        onClick={() => navigate(`/profile/${u.username}`)}
                                        className="bg-neutral-900/50 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group">
                                            
                                        <div className="aspect-square rounded-full overflow-hidden mb-2 shadow-lg relative border border-neutral-800 group-hover:border-neutral-600 transition-colors">
                                            {u.profile_image_url ? (
                                                <img 
                                                    src={getAvatarUrl(u.profile_image_url)} 
                                                    className="w-full h-full object-cover"
                                                    alt={u.username}/>
                                            ) : (
                                                <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                                                    <User size={32} className="text-neutral-400"/>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity"></div>
                                        </div>
                                        
                                        <h3 className="text-sm font-bold truncate text-center">{u.display_name || u.username}</h3>
                                        <p className="text-xs text-neutral-400 truncate text-center mt-0.5">@{u.username}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-neutral-500 text-sm font-normal'>{t('profile.no_followed')}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}