import { Sidebar } from '../components/sidebar.jsx';
import { ProfileContent } from '../components/profile_content.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { useState } from 'react';
import { PlayerBar } from '../components/player_bar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';

export function Profile() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212]">
            <HeaderBar onLogoutClick={() => setIsModalOpen(true)} username="Oleny"/>
            <div className="col-span-2">
                <Sidebar />
            </div>

            <div className="col-span-10 pt-16 h-screen">
                <ProfileContent />
            </div>
            <PlayerBar />
            <LogoutConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => setIsModalOpen(false)} />
        </div>
        </>
    )
}