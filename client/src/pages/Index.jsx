import React, { useState } from 'react';
import { PlayerBar } from '../components/player_bar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';

export function Index(){

    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleLogoutConfirm = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">

            <HeaderBar onLogoutClick={() => setIsModalOpen(true)}  username = "Oleny"/>

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 relative overflow-y-auto ml-64 pt-16 pb-32">

                    <div className="relative h-48 flex items-center justify-center mb-10 mt-5 bg-neutral-800 rounded-xl overflow-hidden shadow-inner border border-white/5">

                        <div className="relative z-10 text-center flex flex-col items-center">
                            <p className="text-xl font-extrabold text-white">Khám phá Âm nhạc</p>
                            <p className="text-sm text-neutral-400 mt-1">Sử dụng thanh phát nhạc cố định bên dưới để điều khiển.</p>
                        </div>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">🎵 Playlist Đề Xuất</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            <div className="p-4 bg-neutral-800/70 rounded-lg flex flex-col items-start gap-2 hover:bg-neutral-700/70 transition-all cursor-pointer">
                                <div className="w-full h-24 bg-neutral-700 rounded mb-2">
                                                                    </div>
                                <h3 className="font-semibold text-sm">Chẳng biết đặt tên gì</h3>
                                <p className="text-xs text-neutral-400">50 bài | Pop, Lofi</p>
                            </div>
                            <div className="p-4 bg-neutral-800/70 rounded-lg flex flex-col items-start gap-2 hover:bg-neutral-700/70 transition-all cursor-pointer">
                                <div className="w-full h-24 bg-neutral-700 rounded mb-2">
                                                                    </div>
                                <h3 className="font-semibold text-sm">Chilll</h3>
                                <p className="text-xs text-neutral-400">30 bài | Rock</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <PlayerBar currentSong="Header In The Cloud"/>

            <LogoutConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleLogoutConfirm}
            />

        </div>
    );
}