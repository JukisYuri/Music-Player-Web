import { useState, useEffect } from 'react';
import { BellOff, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function NotificationContent() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Gọi API lấy thông báo
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:8000/api/notifications/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch (error) {
                console.error("Lỗi lấy thông báo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notif) => {
        navigate(`/profile/${notif.sender_username}`);
        if (notif.is_read) return;

        // Cập nhật State nội bộ ngay lập tức (để lần sau quay lại thấy đã đọc)
        setNotifications(prev => prev.map(n => 
            n.id === notif.id ? { ...n, is_read: true } : n
        ));
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post(`http://localhost:8000/api/notifications/${notif.id}/read/`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    };

    // Format thời gian (VD: 2 giờ/phút trước)
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
    };

    // Xử lý link ảnh
    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    return (
        <div className='flex flex-col h-full bg-[#121212] text-white'>
            <div className="flex flex-col border-b border-neutral-800 pb-4 sticky top-0 bg-[#121212] z-10">
                <h1 className="text-3xl font-bold mb-1 px-6 pt-6">{t('notification.title')}</h1>
                <h2 className="text-base text-neutral-400 px-6">{t('notification.description')}</h2>
            </div>

            <div className='flex-1 overflow-y-auto custom-scrollbar pb-20'>
                {loading ? (
                    <div className="p-6 text-neutral-400">{t('profile.is_loading')}</div>
                ) : notifications.length > 0 ? (
                    <div className="flex flex-col">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                onClick={() => handleNotificationClick(notif)}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-800/50 transition-colors cursor-pointer border-b border-neutral-800/50"
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-700 relative">
                                    {notif.sender_avatar ? (
                                        <img 
                                            src={getAvatarUrl(notif.sender_avatar)} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User size={20} className="text-neutral-400"/>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-1">
                                    <p className="text-sm text-white">
                                        <span className="font-bold hover:underline">{notif.sender_name || notif.sender_username}</span>
                                        <span className="text-neutral-300"> {t('notification.followed_you')}</span>
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {formatTime(notif.created_at)}, @{notif.sender_username}
                                    </p>
                                </div>

                                {/* Trạng thái chưa đọc (chấm xanh) */}
                                {!notif.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className='flex flex-col justify-center items-center h-full mb-20 gap-3 opacity-60'>
                        <BellOff size={64} className="text-neutral-600 mx-auto" />
                        <p className="text-xl text-neutral-300 py-px font-semibold">{t('notification.no_notification')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}