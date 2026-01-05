import React from 'react';
import { useAuth } from '../context/auth_context';

import {
    Library,
    ListMusic,
    Compass,
    Star,
    Mic2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    const navigation = [
        { name: t('sidebar.library'), href: '/library', icon: Library },
        { name: t('sidebar.playlists'), href: '/playlist', icon: ListMusic },
        { name: t('sidebar.discover'), href: '/discover', icon: Compass },
    ];

    const categories = [
        { name: 'Top 100', href: '/charts', icon: Star },
        { name: t('sidebar.genres'), href: '/genres', icon: Mic2 },
    ];

    return (
        <nav className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col space-y-8 z-30 overflow-y-auto">

            <div className="text-white">
                <p className="text-xl font-bold text-green-400"
                    style={{ textShadow: '0 0 6px rgba(74, 222, 128, 0.8), 0 0 12px rgba(74, 222, 128, 0.4)' }}>
                    {t('sidebar.hello')} {user?.display_name || 'User'}!,
                </p>
                <p className="text-sm text-neutral-400">{t('sidebar.description')}</p>
            </div>

            <hr className="border-neutral-800" />

            <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">{t('sidebar.items')}</h3>
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href} 
                        className={`flex items-center p-2 rounded-lg transition-colors group ${
                            location.pathname === item.href 
                            ? 'bg-neutral-800 text-white' // Style khi đang Active
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}>
                        <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                            location.pathname === item.href ? 'text-green-400' : 'text-neutral-400 group-hover:text-green-400'
                        }`} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>

            <hr className="border-neutral-800" />

            <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">{t('sidebar.discover')}</h3>
                {categories.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center p-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors group">
                        <item.icon className="h-5 w-5 mr-3 text-neutral-400 group-hover:text-green-400 transition-colors" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="h-10"></div>
        </nav>
    );
}