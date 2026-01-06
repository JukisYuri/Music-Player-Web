import { useState, useRef } from 'react';
import { useAuth } from '../context/auth_context.jsx'; // Đảm bảo đường dẫn đúng
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
    Mic,
    Loader2,
    Square
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function HeaderBar({ onLogoutClick }) {
    // Lấy user, loading và hàm logout từ "Kho chung"
    const { user, loading, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // --- State ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingVoice, setIsLoadingVoice] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // --- Refs ---
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const searchInputRef = useRef(null);

    // --- Helper xử lý link ảnh ---
    const getAvatarUrl = (path) => {
        if (!path) return null; // Trả về null để hiện icon mặc định
        if (path.startsWith('http')) return path; // Link Google hoặc link tuyệt đối
        return `http://localhost:8000${path}`; // Link local từ Django
    };

    const dropdownItems = [
        { name: t('header_bar.account'), href: '/profile', icon: UserCircle },
        { name: t('header_bar.setting'), href: '/setting', icon: Settings },
        { name: t('header_bar.logout'), href: '/logout', icon: LogOut, isLogout: true },
    ];

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Sự kiện chạy khi bấm "Xác nhận" trên Modal
    const handleLogoutClick = (e) => {
        e.preventDefault();
        setIsMenuOpen(false); // Đóng menu dropdown
        setShowLogoutModal(true); // Mở modal xác nhận
    };

    // Xử lý khi xác nhận đăng xuất
    const handleConfirmLogout = () => {
        logout(); // Xóa token
        setShowLogoutModal(false);
        if (onLogoutClick) onLogoutClick();
        // Refresh trang về Login
        window.location.href = '/login';
    };

    // --- LOGIC GHI ÂM ---
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
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = sendAudioToBackend;
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone Access Error:", err);
                alert("Không thể truy cập Microphone. Vui lòng cấp quyền.");
            }
        }
    };

    const sendAudioToBackend = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'voice_command.webm');

        try {
            const response = await fetch('http://localhost:8000/api/voice/process/', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setIsLoadingVoice(false);

            if (data.status === 'success') {
                processVoiceCommand(data);
            } else {
                console.error("Voice Error:", data.message);
                alert("Không nhận diện được giọng nói.");
            }
        } catch (error) {
            console.error("Server Error:", error);
            setIsLoadingVoice(false);
            alert("Lỗi kết nối tới Server.");
        }
    };

    const processVoiceCommand = (data) => {
        const finalContent = data.keyword || data.text;
        setSearchText(finalContent);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${encodeURIComponent(searchText)}`);
        }
    };

    return (
        <>
        <header className="fixed top-0 left-0 w-full h-16 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 z-40 shadow-lg">
            <div className="h-full mx-auto px-6 flex items-center justify-between">

                <div className="flex items-center">
                    <Link to="/index" className="flex items-center gap-2 text-white hover:text-green-400 transition-colors p-1">
                        <Music size={26} className="text-green-500" />
                        <span className="text-xl font-bold tracking-wider hidden sm:inline">MusicPlayer</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6 flex-1 justify-center mx-4">
                    <Link to="/index" className="text-neutral-400 hover:text-green-400 transition-colors p-1">
                        <Home size={22} />
                    </Link>

                    <div className="relative flex-1 max-w-md group">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 group-focus-within:text-green-500 transition-colors" />

                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={isRecording ? "Đang nghe..." : t('header_bar.search_placeholder', 'Tìm kiếm...')}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full bg-neutral-800 border ${isRecording ? 'border-green-500 ring-1 ring-green-500' : 'border-neutral-700'} rounded-full py-2 pl-10 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all`}
                        />

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
                    </div>

                    <Link to="/notification" className="relative text-neutral-400 hover:text-green-400 transition-colors p-1">
                        <Bell size={30} className="text-neutral-400 hover:text-green-400 transition-colors p-1"/>
                    </Link>
                </div>

                {/* --- 3. USER AREA --- */}
                <div className="relative min-w-[150px] flex justify-end">
                    {/* Trường hợp đang load dữ liệu user */}
                    {loading ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50">
                            <Loader2 size={18} className="animate-spin text-green-500" />
                            <span className="text-sm text-neutral-500">Loading...</span>
                        </div>
                    ) : user ? (
                        /* Trường hợp đã đăng nhập */
                        <>
                            <button
                                onClick={handleMenuToggle}
                                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors focus:outline-none border border-transparent hover:border-white/10">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-neutral-700 shrink-0">
                                    {user.profile_image_url ? (
                                        <img 
                                            src={getAvatarUrl(user.profile_image_url)} 
                                            alt="User Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold">
                                            {/* Lấy chữ cái đầu của tên */}
                                            {(user.display_name || "U").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Tên hiển thị */}
                                <span className="text-sm font-medium text-green-400 hidden md:inline-block max-w-[100px] truncate">
                                    {user.display_name}
                                </span>
                                
                                <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                                    {dropdownItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            // Nếu là nút Logout thì gọi hàm logout, ngược lại chỉ đóng menu
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
                        /* Trường hợp chưa đăng nhập */
                        <div className="flex items-center gap-3">
                            <Link to="/register" className="text-neutral-400 hover:text-white text-sm font-medium transition-colors">
                                Đăng ký
                            </Link>
                            <Link to="/login" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors">
                                Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
            {/* 5. Render Modal xác nhận ở đây */}
            <LogoutConfirmModal 
            isOpen={showLogoutModal} 
            onClose={() => setShowLogoutModal(false)} 
            onConfirm={handleConfirmLogout} 
        />
    </>
    );
}