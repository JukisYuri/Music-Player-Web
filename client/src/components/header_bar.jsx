import { useState } from 'react';
import {
    Home,
    Search,
    ChevronDown,
    User,
    Music,
    Settings,
    LogOut,
    UserCircle,
    Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Chứa Logo, nút Home, Search và User Profile với Dropdown và Modal xác nhận Đăng xuất.
 * @param {function} onLogoutClick - Hàm để thông báo cho component cha (Index) mở Modal.
 * @param username - tên người dùng
 */
export function HeaderBar({ onLogoutClick ,username = "Oleny"}) {
    const userName = username;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dropdownItems = [
        { name: 'Tài khoản', href: '/profile', icon: UserCircle },
        { name: 'Cài đặt', href: '/setting', icon: Settings },
        { name: 'Đăng xuất', href: '/logout', icon: LogOut, isLogout: true },
    ];

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        onLogoutClick();
        setIsMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 w-full h-16 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 z-40 shadow-lg">
            <div className=" h-full mx-auto px-6 flex items-center justify-between">

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
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài hát, nghệ sĩ, playlist..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all"
                        />
                    </div>
                    <Link to="/notification" className="relative text-neutral-400 hover:text-green-400 transition-colors p-1">
                        <Bell size={30} className="text-neutral-400 hover:text-green-400 transition-colors p-1"/>
                    </Link>
                </div>

                <div className="relative">
                    <button
                        onClick={handleMenuToggle}
                        className="flex items-center gap-2 p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors focus:outline-none"
                        aria-expanded={isMenuOpen}
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