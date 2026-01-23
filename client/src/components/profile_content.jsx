import { useState, useRef, useEffect } from 'react';
import {
    PenLine, X, Save, Camera, UserRoundPen, User,
    Check, Plus, Play, History, Music2, Mic2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/auth_context.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';

export function ProfileContent() {
    const { t } = useTranslation();
    const { user: authUser, loading: authLoading, fetchUser } = useAuth();
    const { playSong } = useMusic();
    const { username } = useParams();
    const navigate = useNavigate();

    // State cho Profile
    const [displayUser, setDisplayUser] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    // State cho Edit Profile
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});

    // State cho Âm nhạc và Following
    const [musicData, setMusicData] = useState({ recently_played: [], genres_grouped: [], artists_grouped: [] });
    const [isMusicLoading, setIsMusicLoading] = useState(false);
    const [followingList, setFollowingList] = useState([]);

    // 1. Logic xác định User Profile cần hiển thị
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsProfileLoading(true);
            if (!username || (authUser && username === authUser.username)) {
                setDisplayUser(authUser);
                setIsOwnProfile(true);
                setIsProfileLoading(false);
            } else {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:8000/api/user/profile/${username}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setDisplayUser(res.data);
                    setIsOwnProfile(false);
                } catch (error) {
                    console.error("Loi lay profile user khac:", error);
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

    // 2. Logic lấy dữ liệu âm nhạc (Discovery) cho Profile
    useEffect(() => {
        const fetchMusicDiscovery = async () => {
            if (!displayUser?.id) return;
            setIsMusicLoading(true);
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/music/discovery/?user_id=${displayUser.id}`);
                if (res.ok) {
                    const result = await res.json();
                    setMusicData(result);
                }
            } catch (err) {
                console.error("Loi fetch nhac profile:", err);
            } finally {
                setIsMusicLoading(false);
            }
        };

        fetchMusicDiscovery();
    }, [displayUser]);

    // 3. Logic lấy danh sách Following (Chỉ khi xem profile minh)
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
                    console.error("Loi lay danh sach following:", error);
                }
            }
        };
        fetchFollowing();
    }, [isOwnProfile, authUser]);

    // --- CÁC HÀM XỬ LÝ (HANDLERS) ---

    const handleOpenEdit = () => {
        if (displayUser) {
            setTempProfile({
                display_name: displayUser.display_name || '',
                description: displayUser.description || '',
            });
        }
        setIsEditing(true);
    };

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
        if (fileInputRef.current) fileInputRef.current.click();
    };

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
                    'Content-Type': undefined
                }
            });
            await fetchUser();
            setIsEditing(false);
            alert("Cap nhat thanh cong!");
        } catch (error) {
            console.error("Loi cap nhat:", error);
            alert("Cap nhat that bai!");
        }
    };

    const handleFollowToggle = async () => {
        if (!displayUser) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:8000/api/user/follow/${displayUser.username}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisplayUser(prev => ({
                ...prev,
                is_following: res.data.is_following,
                followers_count: res.data.follower_count
            }));
        } catch (error) {
            console.error("Loi follow:", error);
        }
    };

    const getAvatarUrl = (path) => {
        if (!path) return 'https://i.pinimg.com/736x/c5/ae/a6/c5aea65e8537746d6c8af1de3eea04f6.jpg';
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    // --- COMPONENT CON (UI) ---

    const SongCard = ({ song }) => (
        <div className="group relative bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer w-44 shrink-0 border border-white/5 shadow-xl">
            <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-neutral-800">
                <img src={song.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={song.title} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <button
                        onClick={(e) => { e.stopPropagation(); playSong(song); }}
                        className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110">
                        <Play fill="white" size={24} className="ml-1 text-white" />
                    </button>
                </div>
            </div>
            <h3 className="font-bold truncate text-white text-sm group-hover:text-red-400 transition-colors">{song.title}</h3>
            <p className="text-xs text-neutral-400 truncate mt-1">{song.artist}</p>
        </div>
    );

    const MusicSection = ({ title, icon: Icon, songs, gradient }) => {
        if (!songs || songs.length === 0) return null;
        return (
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="text-white" size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>
                <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {songs.map(song => <SongCard key={song.id} song={song} />)}
                </div>
            </div>
        );
    };

    if (authLoading || isProfileLoading) {
        return <div className="text-white p-10">{t('profile.is_loading')}</div>;
    }

    if (!displayUser) {
        return <div className="text-white p-10 text-2xl font-bold flex gap-2"><UserRoundPen size={32}/>{t('profile.no_user')}</div>;
    }

    return (
        <div className="relative h-full bg-[#121212] text-white overflow-y-auto custom-scrollbar overflow-x-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#7F1D1D]/30 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ef4444]/10 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite_1s]" />
            </div>

            {/* MODAL EDIT */}
            {isEditing && isOwnProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                        <div className="bg-linear-to-b from-[#7F1D1D] via-[#451010] to-[#1e1e1e] p-8 pb-10">
                            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer">
                                <X size={24} />
                            </button>
                            <div className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                                <PenLine size={20} /> {t('profile.edit_profile2')}
                            </div>
                            <div className="flex flex-row gap-10 items-start">
                                <div className="group relative shrink-0">
                                    <div onClick={handleTriggerFileSelect} className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-[#1e1e1e] bg-black cursor-pointer relative">
                                        <img src={tempProfile.avatar_preview || getAvatarUrl(displayUser.profile_image_url)} className="w-full h-full object-cover opacity-100 group-hover:opacity-50 transition-opacity" alt="Avatar Preview" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Camera size={40} className="text-white" />
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                </div>
                                <div className="flex flex-col flex-1 mt-2">
                                    <input type="text" maxLength={30} value={tempProfile.display_name} onChange={(e) => setTempProfile({...tempProfile, display_name: e.target.value})} className="text-white text-4xl font-semibold bg-transparent border-b border-white/20 focus:border-white outline-none w-auto min-w-[200px] transition-all" placeholder="Ten hien thi" />
                                    <textarea maxLength={150} value={tempProfile.description} onChange={(e) => setTempProfile({...tempProfile, description: e.target.value})} className="text-white text-lg font-normal mt-6 w-full bg-transparent border-b border-white/20 focus:border-white outline-none resize-none h-24 placeholder-white/30 leading-relaxed transition-all" placeholder={t('profile.bio')} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1e1e1e] px-8 py-4 flex justify-end gap-3 border-t border-white/5">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-full text-white font-medium hover:bg-white/10 transition-colors cursor-pointer">{t('global.cancel')}</button>
                            <button onClick={handleSave} className="px-8 py-2 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer"><Save size={16} /> {t('global.save')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10">
                <div className="bg-linear-to-b from-[#7F1D1D]/90 via-[#451010]/80 to-[#121212] p-8 pb-6 backdrop-blur-sm">
                    <div className="text-white text-3xl font-bold mb-4">{t('profile.title')}</div>
                    <div className="flex flex-row gap-10">
                        <div className="relative group shrink-0 w-48 h-48 flex items-center justify-center">
                            <div className="absolute -inset-3 bg-[conic-gradient(transparent,transparent,#ef4444)] rounded-full animate-spin blur-md opacity-70" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute -inset-1 bg-[conic-gradient(transparent,transparent,#ff0000)] rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#121212] z-10">
                                <img src={getAvatarUrl(displayUser.profile_image_url)} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center gap-2">
                                <div className="text-white text-4xl font-semibold mt-4">{displayUser.display_name || displayUser.username}</div>
                                <div className="text-white text-2xl font-light mt-6 opacity-80">@{displayUser.username}</div>
                            </div>
                            <div className="text-white text-lg font-normal mt-4 max-w-2xl italic opacity-90">"{displayUser.description || t('profile.no_bio')}"</div>
                            <div className="mt-6 flex flex-row items-center gap-4">
                                {isOwnProfile ? (
                                    <button onClick={handleOpenEdit} className="cursor-pointer flex items-center gap-2 bg-white/10 border border-white/20 hover:border-white text-white text-sm font-bold tracking-widest uppercase py-2 px-6 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20 backdrop-blur-md">
                                        <PenLine size={16} /> {t('profile.edit_profile')}
                                    </button>
                                ) : (
                                    <button onClick={handleFollowToggle} className={`cursor-pointer flex items-center gap-2 text-sm font-bold tracking-widest uppercase py-2 px-6 rounded-full transition-all duration-300 hover:scale-105 ${displayUser.is_following ? 'bg-transparent border border-white text-white' : 'bg-white text-black hover:bg-neutral-200'}`}>
                                        {displayUser.is_following ? <Check size={16}/> : <Plus size={16}/>}
                                        {displayUser.is_following ? t('search.followed') : t('search.follow')}
                                    </button>
                                )}
                                <p className='text-white text-sm font-medium opacity-70'>{displayUser.followers_count || 0} {t('profile.followers')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PHẦN ÂM NHẠC (DISCOVERY STYLE) --- */}
                <div className="mt-8 mx-8">
                    {isMusicLoading ? (
                        <p className="text-neutral-500 animate-pulse">Dang tai nhac...</p>
                    ) : (
                        <>
                            <MusicSection
                                title="Nghe gan day"
                                icon={History}
                                songs={musicData.recently_played}
                                gradient="from-red-600 to-orange-600"
                            />

                        </>
                    )}
                </div>

                {/* --- FOLLOWING LIST --- */}
                {isOwnProfile && (
                    <div className='mt-8 mx-8 pb-10 border-t border-white/5 pt-8'>
                        <div className='flex flex-row gap-3 items-baseline mb-6'>
                            <p className='text-white text-2xl font-bold'>{t('profile.following')}</p>
                            <p className='text-neutral-400 text-base font-normal'>{displayUser.following_count || 0} {t('profile.followed')}</p>
                        </div>
                        {followingList.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-20">
                                {followingList.map((u) => (
                                    <div key={u.id} onClick={() => navigate(`/profile/${u.username}`)} className="bg-neutral-900/50 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                                        <div className="aspect-square rounded-full overflow-hidden mb-2 shadow-lg border border-neutral-800">
                                            {u.profile_image_url ? (
                                                <img src={getAvatarUrl(u.profile_image_url)} className="w-full h-full object-cover" alt={u.username}/>
                                            ) : (
                                                <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                                                    <User size={32} className="text-neutral-400"/>
                                                </div>
                                            )}
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
    );
}