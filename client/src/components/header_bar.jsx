import { useState, useRef, useEffect, use } from 'react';
import { useAuth } from '../context/auth_context.jsx';
import { LogoutConfirmModal } from './logout_confirm_modal.jsx';
import {
    Home,
    Search,
    ChevronDown,
    Music,
    Settings,
    LogOut,
    UserCircle,
    Bell,
    BellDot,
    Mic,
    Loader2,
    Square,
    X // Thêm icon X để xóa text
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export function HeaderBar({ onLogoutClick }) {
    const { user, loading, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // --- State ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    // State cho Voice
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingVoice, setIsLoadingVoice] = useState(false);

    // State cho Search & Suggestion
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]); // Danh sách gợi ý
    const [showDropdown, setShowDropdown] = useState(false); // Ẩn/Hiện dropdown

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // --- Refs ---
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const searchInputRef = useRef(null);
    const debounceTimeoutRef = useRef(null); // Ref cho Debounce
    const searchContainerRef = useRef(null); // Ref để bắt click outside

    // --- Helper xử lý link ảnh ---
    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://127.0.0.1:8000${path}`;
    };

    const dropdownItems = [
        { name: t('header_bar.account'), href: '/profile', icon: UserCircle },
        { name: t('header_bar.setting'), href: '/setting', icon: Settings },
        { name: t('header_bar.logout'), href: '/logout', icon: LogOut, isLogout: true },
    ];

    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setIsMenuOpen(false);
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        if (onLogoutClick) onLogoutClick();
        window.location.href = '/login';
    };

    // --- LOGIC TÌM KIẾM & GỢI Ý (MỚI) ---

    // 1. Gọi API Gợi ý
    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/suggest/search/?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSuggestions(data);
            setShowDropdown(true);
        } catch (err) {
            console.error("Lỗi gợi ý:", err);
        }
    };

    // 2. Xử lý khi gõ phím (Debounce)
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchText(value);

        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

        // Đợi 300ms sau khi ngừng gõ mới gọi API
        debounceTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    // 3. Khi chọn một gợi ý
    const handleSelectSuggestion = (song) => {
        setShowDropdown(false);
        setSearchText(song.title);
        navigate(`/song/${song.id}`); // Chuyển thẳng đến bài hát
    };

    // 4. Xử lý Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchText)}`);
        }
    };

    // 5. Click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // --- LOGIC GHI ÂM (GIỮ NGUYÊN) ---
    const handleToggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            setIsLoadingVoice(true);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = sendAudioToBackend;
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone Access Error:", err);
                alert("Không thể truy cập Microphone.");
            }
        }
    };

    const sendAudioToBackend = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'voice_command.webm');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/voice/process/', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setIsLoadingVoice(false);

            if (data.status === 'success') {
                processVoiceCommand(data);
            } else {
                alert("Không nhận diện được giọng nói.");
            }
        } catch (error) {
            setIsLoadingVoice(false);
            alert("Lỗi kết nối tới Server.");
        }
    };

    const processVoiceCommand = (data) => {
        const finalContent = data.keyword || data.text;
        setSearchText(finalContent);
        fetchSuggestions(finalContent); // Gọi gợi ý ngay khi có giọng nói
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    const checkUnreadNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:8000/api/notifications/unread-count/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Nếu số lượng > 0 thì set true
            setHasUnread(res.data.unread_count > 0);
        } catch (error) {
            console.error("Lỗi check notif:", error);
        }
    };

    useEffect(() => {
        checkUnreadNotifications();
        // Polling: Tự động check mỗi 60 giây
        const interval = setInterval(checkUnreadNotifications, 60000);
        // Clear interval khi unmount
        return () => clearInterval(interval);
    }, [location.pathname]);

    return (
        <>
        <header className="fixed top-0 left-0 w-full h-16 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 z-40 shadow-lg">
            <div className="h-full mx-auto px-6 flex items-center justify-between">

                {/* LOGO */}
                <div className="flex items-center">
                    <Link to="/index" className="flex items-center gap-2 text-white hover:text-green-400 transition-colors p-1">
                        <Music size={26} className="text-green-500" />
                        <span className="text-xl font-bold tracking-wider hidden sm:inline">MusicPlayer</span>
                    </Link>
                </div>

                {/* CENTER: NAVIGATION & SEARCH */}
                <div className="flex items-center gap-6 flex-1 justify-center mx-4">
                    <Link to="/index" className="text-neutral-400 hover:text-green-400 transition-colors p-1">
                        <Home size={22} />
                    </Link>

                    {/* --- SEARCH BAR CONTAINER --- */}
                    <div className="relative flex-1 max-w-md group" ref={searchContainerRef}>
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 group-focus-within:text-green-500 transition-colors" />

                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={isRecording ? "Đang nghe..." : t('header_bar.search_placeholder', 'Tìm kiếm...')}
                            value={searchText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => searchText && setShowDropdown(true)}
                            className={`w-full bg-neutral-800 border ${isRecording ? 'border-green-500 ring-1 ring-green-500' : 'border-neutral-700'} rounded-full py-2 pl-10 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all`}
                        />

                        {/* Nút Clear Text */}
                        {searchText && !isRecording && !isLoadingVoice && (
                            <button
                                onClick={() => { setSearchText(''); setSuggestions([]); }}
                                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {/* Nút Voice */}
                        <button
                            onClick={handleToggleRecording}
                            disabled={isLoadingVoice}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-green-400"
                        >
                            {isLoadingVoice ? (
                                <Loader2 size={18} className="animate-spin text-green-500" />
                            ) : isRecording ? (
                                <Square size={18} className="text-red-500 fill-current animate-pulse" />
                            ) : (
                                <Mic size={18} />
                            )}
                        </button>

                        {/* --- DROPDOWN GỢI Ý --- */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-80 overflow-y-auto">
                                    <p className="text-[10px] font-bold text-neutral-500 px-3 py-2 uppercase tracking-wider bg-neutral-800/50">Gợi ý</p>
                                    {suggestions.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="flex items-center gap-3 p-2 hover:bg-neutral-800 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                                                {item.cover ? <img src={item.cover} className="w-full h-full object-cover"/> : <div className="bg-neutral-800 w-full h-full flex items-center justify-center"><Music size={14}/></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate hover:text-green-400 transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-neutral-400 truncate flex items-center gap-2">
                                                    {item.artist}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/notification" className="relative p-1 group">
                        {hasUnread ? (
                            <BellDot 
                                size={24} 
                                className="text-red-500 hover:text-red-400 transition-colors animate-pulse" 
                            />
                        ) : (
                            <Bell 
                                size={24} 
                                className="text-neutral-400 group-hover:text-green-400 transition-colors" 
                            />
                        )}
                    </Link>
                </div>

                {/* USER AREA (Giữ nguyên) */}
                <div className="relative min-w-[150px] flex justify-end">
                    {loading ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50">
                            <Loader2 size={18} className="animate-spin text-green-500" />
                            <span className="text-sm text-neutral-500">Loading...</span>
                        </div>
                    ) : user ? (
                        <>
                            <button
                                onClick={handleMenuToggle}
                                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors focus:outline-none border border-transparent hover:border-white/10">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-neutral-700 shrink-0">
                                    {user.profile_image_url ? (
                                        <img src={getAvatarUrl(user.profile_image_url)} alt="User" className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold">
                                            {(user.display_name || "U").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-green-400 hidden md:inline-block max-w-[100px] truncate">
                                    {user.display_name}
                                </span>
                                <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                                    {dropdownItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={item.isLogout ? handleLogoutClick : () => setIsMenuOpen(false)}
                                            className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                                                item.isLogout 
                                                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                                                : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                                            }`}>
                                            <item.icon size={18} className="mr-3 opacity-80" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/register" className="text-neutral-400 hover:text-white text-sm font-medium transition-colors">Đăng ký</Link>
                            <Link to="/login" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors">Đăng nhập</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
        <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleConfirmLogout} />
    </>
    );
}