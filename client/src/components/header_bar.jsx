import { useState, useRef } from 'react';
import {
    Home,
    Search,
    ChevronDown,
    User,
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

export function HeaderBar({ onLogoutClick, username = "Oleny" }) {
    const userName = username;
    const { t } = useTranslation();
    const navigate = useNavigate();

    // --- State ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // --- Refs ---
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const searchInputRef = useRef(null);

    const dropdownItems = [
        { name: t('header_bar.account'), href: '/profile', icon: UserCircle },
        { name: t('header_bar.setting'), href: '/setting', icon: Settings },
        { name: t('header_bar.logout'), href: '/logout', icon: LogOut, isLogout: true },
    ];

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        onLogoutClick();
        setIsMenuOpen(false);
    };

    // --- LOGIC GHI ÂM ---
    const handleToggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            setIsLoading(true);
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
            setIsLoading(false);

            if (data.status === 'success') {
                processVoiceCommand(data);
            } else {
                console.error("Voice Error:", data.message);
                alert("Không nhận diện được giọng nói.");
            }
        } catch (error) {
            console.error("Server Error:", error);
            setIsLoading(false);
            alert("Lỗi kết nối tới Server.");
        }
    };

    // --- SỬA ĐỔI QUAN TRỌNG Ở ĐÂY ---
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
                            ref={searchInputRef} // Gắn ref vào đây
                            type="text"
                            placeholder={isRecording ? "Đang nghe..." : t('header_bar.search_placeholder')}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full bg-neutral-800 border ${isRecording ? 'border-green-500 ring-1 ring-green-500' : 'border-neutral-700'} rounded-full py-2 pl-10 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all`}
                        />

                        <button
                            onClick={handleToggleRecording}
                            disabled={isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-green-400"
                            title="Nhập bằng giọng nói"
                        >
                            {isLoading ? (
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

                <div className="relative">
                    <button
                        onClick={handleMenuToggle}
                        className="flex items-center gap-2 p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors focus:outline-none"
                    >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <User size={18} />
                        </div>
                        <span
                            className="text-sm font-medium mr-1 text-green-400 hidden md:inline"
                            style={{ textShadow: '0 0 5px rgba(74, 222, 128, 0.7), 0 0 10px rgba(74, 222, 128, 0.3)' }}
                        >
                            {userName}
                        </span>
                        <ChevronDown size={16} className={`text-neutral-400 mr-2 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-50">
                            {dropdownItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={item.isLogout ? handleLogoutClick : () => setIsMenuOpen(false)}
                                    className={`flex items-center px-4 py-2 text-sm transition-colors ${
                                        item.isLogout ? 'text-red-400 hover:bg-red-900/40' : 'text-neutral-300 hover:bg-neutral-700'
                                    }`}
                                >
                                    <item.icon size={18} className="mr-3" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}