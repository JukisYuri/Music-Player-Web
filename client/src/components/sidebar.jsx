import React from 'react';

import {
    Library,
    ListMusic,
    Compass,
    Star,
    Mic2
} from 'lucide-react';

const navigation = [
    { name: 'Thư viện', href: '/library', icon: Library },
    { name: 'Danh sách phát', href: '/playlist', icon: ListMusic },
    { name: 'Khám phá', href: '/discover', icon: Compass },
];

const categories = [
    { name: 'Top 100', href: '/charts', icon: Star },
    { name: 'Chủ đề và Thể loại', href: '/genres', icon: Mic2 },
];

export function Sidebar() {

    const userName = "Oleny";

    return (
        <nav className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col space-y-8 z-30 overflow-y-auto">

            <div className="text-white">
                <p className="text-xl font-bold text-green-400"
                    style={{ textShadow: '0 0 6px rgba(74, 222, 128, 0.8), 0 0 12px rgba(74, 222, 128, 0.4)' }}>
                    Chào {userName},
                </p>
                <p className="text-sm text-neutral-400">Hôm nay bạn muốn nghe thể loại gì?</p>
            </div>

            <hr className="border-neutral-800" />

            <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">Các mục</h3>
                {navigation.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center p-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors group"
                    >
                        <item.icon className="h-5 w-5 mr-3 text-neutral-400 group-hover:text-green-400 transition-colors" />
                        <span className="font-medium">{item.name}</span>
                    </a>
                ))}
            </div>

            <hr className="border-neutral-800" />

            <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">Khám phá</h3>
                {categories.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center p-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors group"
                    >
                        <item.icon className="h-5 w-5 mr-3 text-neutral-400 group-hover:text-green-400 transition-colors" />
                        <span className="font-medium">{item.name}</span>
                    </a>
                ))}
            </div>

            <div className="h-10"></div>
        </nav>
    );
}