import { useState, useRef, useEffect } from 'react';
import { PenLine, X, Save, Camera, UserRoundPen, User } from 'lucide-react';
import { ProfileListSong } from './profile_listsong';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/auth_context.jsx';
import { useNavigate } from 'react-router-dom';

export function ProfileContent() {
    const { t } = useTranslation();
    const { user, loading, fetchUser } = useAuth();
    const fileInputRef = useRef(null);
    // State cho Modal edit
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const navigate = useNavigate();
    // State lưu danh sách người đang follow
    const [followingList, setFollowingList] = useState([]);

    // Gọi API lấy danh sách following khi component load
    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await axios.get('http://localhost:8000/api/user/me/following/', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFollowingList(res.data);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách following:", error);
            }
        };

        fetchFollowing();
    }, [user]);

    // Khi mở modal, copy dữ liệu user hiện tại vào temp
    const handleOpenEdit = () => {
        if (user) {
            setTempProfile({
                // Map dữ liệu từ User state sang form
                display_name: user.display_name || '',
                description: user.description || '',
            });
        }
        setIsEditing(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Tạo URL ảo để xem trước ảnh ngay lập tức
            const previewUrl = URL.createObjectURL(file);
            
            setTempProfile({
                ...tempProfile,
                avatar_preview: previewUrl, // Dùng để hiển thị
                avatar_file: file           // Dùng để gửi lên Server
            });
        }
    };
    // Hàm trigger file input
    const handleTriggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Hàm lưu
    const handleSave = async () => {
        try {
            console.log("File ảnh đang gửi:", tempProfile.avatar_file);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('display_name', tempProfile.display_name);
            formData.append('description', tempProfile.description);
            if (tempProfile.avatar_file) {
                formData.append('profile_image_url', tempProfile.avatar_file); 
            }
            // 1. Gọi API cập nhật lên Server
            await axios.patch('http://localhost:8000/api/user/update-profile/', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': undefined // Để trình duyệt tự set boundary cho multipart/form-data
                }
            });
            await fetchUser(); // 2. Cập nhật lại thông tin user mới nhất từ server
            setIsEditing(false);
            alert("Cập nhật thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại!");
        }
    };

    // Helper: Xử lý link ảnh (ghép localhost nếu cần)
    const getAvatarUrl = (path) => {
        if (!path) return 'https://i.pinimg.com/736x/c5/ae/a6/c5aea65e8537746d6c8af1de3eea04f6.jpg'; // Không có avatar nào thì trỏ vào đây
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    // 2. Màn hình chờ
    if (loading) {
        return <div className="text-white p-10">{t('profile.is_loading')}</div>;
    }

    if (!user) {
        return <div className="text-white p-10 text-2xl font-bold flex gap-2"><UserRoundPen size={32}/>{t('profile.no_user')}</div>;
    }

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
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer">
                                <X size={24} />
                            </button>

                            <div className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                                <PenLine size={20} /> {t('profile.edit_profile2')}
                            </div>

                            <div className="flex flex-row gap-10 items-start">
                                {/* 1. EDIT AVATAR */}
                                <div className="group relative shrink-0">
                                    {/* Thêm sự kiện onClick vào đây và cursor-pointer */}
                                    <div 
                                        onClick={handleTriggerFileSelect}
                                        className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-[#1e1e1e] bg-black cursor-pointer relative"
                                    >
                                        {/* Logic hiển thị: Ưu tiên ảnh vừa chọn (preview) -> Nếu không thì lấy ảnh cũ */}
                                        <img 
                                            src={tempProfile.avatar_preview || getAvatarUrl(user.profile_image_url)} 
                                            className="w-full h-full object-cover opacity-100 group-hover:opacity-50 transition-opacity"
                                            alt="Avatar Preview"
                                        />
                                        
                                        {/* Icon Camera hiện lên khi hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Camera size={40} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Input file bị ẩn đi (hidden), được kích hoạt bởi Ref */}
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

                                {/* 2. EDIT INFO */}
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
                                            @{user.username}
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
                            <div className="absolute -inset-3 bg-[conic-gradient(transparent,transparent,#ef4444)] rounded-full animate-spin blur-md opacity-70" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute -inset-1 bg-[conic-gradient(transparent,transparent,#ff0000)] rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                            
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#121212] z-10">
                                <img 
                                    src={getAvatarUrl(user.profile_image_url)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center gap-2">
                                <div className="text-white text-4xl font-semibold mt-4">
                                    {user.display_name}
                                </div>
                                <div className="text-white text-2xl font-light mt-6 opacity-80">
                                    @{user.username}
                                </div>
                            </div>
                            <div className="text-white text-lg font-normal mt-4 max-w-2xl italic opacity-90">
                                "{user.description || t('profile.no_bio')}"
                            </div>
                            <div className="mt-6 flex flex-row items-center gap-4">
                                <button 
                                    onClick={handleOpenEdit}
                                    className="cursor-pointer flex items-center gap-2 bg-white/10 border border-white/20 hover:border-white text-white text-sm font-bold tracking-widest uppercase py-2 px-6 rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/20 backdrop-blur-md">
                                    <PenLine size={16} />
                                    {t('profile.edit_profile')}
                                </button>
                                <p className='text-white text-sm font-medium opacity-70'>{user.followers_count || 0} {t('profile.followers')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logic cho phần Often Listenning Songs */}
                {/* <div className='mt-8 ml-8'>
                    <p className='text-white text-2xl font-bold'>{t('profile.listened_songs')}</p>
                    <p className='text-neutral-400 text-base font-normal mt-2'>{t('profile.visible_for_you')}</p>
                </div>

                <div className="flex flex-col mx-2 mt-4 gap-2">
                    <ProfileListSong />
                </div> */}

                {/* Logic cho phần Following */}
                <div className='mt-8 mx-8 pb-10'>
                <div className='flex flex-row gap-3 items-baseline mb-4'>
                    <p className='text-white text-2xl font-bold'>{t('profile.following')}</p>
                    <p className='text-neutral-400 text-base font-normal'>{user.following_count || 0} {t('profile.followed')}</p>
                </div>
                {followingList.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-20">
                        {followingList.map((u) => (
                            <div 
                                key={u.id} 
                                onClick={() => navigate(`/profile/${u.username}`)}
                                className="bg-neutral-900/50 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group">
                                    
                                {/* Avatar Container */}
                                <div className="aspect-square rounded-full overflow-hidden mb-2 shadow-lg relative border border-neutral-800 group-hover:border-neutral-600 transition-colors"> {/* Giảm mb xuống 2 */}
                                    {u.profile_image_url ? (
                                        <img 
                                            src={getAvatarUrl(u.profile_image_url)} 
                                            className="w-full h-full object-cover"
                                            alt={u.username}/>
                                    ) : (
                                        <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                                            <User size={32} className="text-neutral-400"/> {/* Icon nhỏ hơn chút */}
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity"></div>
                                </div>
                                
                                {/* Text Info */}
                                <h3 className="text-sm font-bold truncate text-center">{u.display_name || u.username}</h3>
                                <p className="text-xs text-neutral-400 truncate text-center mt-0.5">@{u.username}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-neutral-500 text-sm font-normal'>{t('profile.no_followed')}</p>
                )}
            </div>
        </div>
    </div>
    )
}