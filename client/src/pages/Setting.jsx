import { useState } from "react";
import { Sidebar } from '../components/sidebar.jsx';
import { HeaderBar } from '../components/header_bar.jsx';
import { PlayerBar } from '../components/player_bar.jsx';
import { LogoutConfirmModal } from '../components/logout_confirm_modal.jsx';
import { useTranslation } from 'react-i18next';
import i18n from "../i18n.js";

export function Setting() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    const handleLanguageChange = (e) => {
        const language = e.target.value;
        setSelectedLanguage(language);
        i18n.changeLanguage(language);
    };



    return (
        <>
        <div className="w-screen h-screen grid grid-cols-12 bg-[#121212] overflow-x-hidden overflow-y-hidden">
            <HeaderBar onLogoutClick={() => setIsModalOpen(true)} username="Oleny"/>
            <div className="col-span-2">
                <Sidebar />
            </div>
            
            <div className="col-span-10 pt-16 h-screen mt-6 flex flex-col gap-8 px-8"> 
                <div className="flex flex-col">
                    {/* trick lỏ -mx-8 (kéo ra) và px-8 (đẩy chữ vào) */}
                    <div className="flex flex-col gap-1 border-b border-neutral-700 pb-4 -mx-8 px-8">
                        <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
                        <h2 className="text-base text-neutral-400">{t('settings.description')}</h2>
                    </div>
                    <div className="flex flex-row gap-2 justify-between items-center mt-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-white text-xl font-bold">{t('settings.language')}</h2>
                            <p className="text-neutral-300 text-base">{t('settings.lang_desc')}</p>
                        </div>
                        <select 
                            className="bg-[#282828] text-white p-2 rounded-md border border-neutral-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10 w-40 cursor-pointer"
                            value={selectedLanguage}
                            onChange={handleLanguageChange}>
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
            <PlayerBar />
            <LogoutConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => setIsModalOpen(false)} />
        </div>
        </>
    )
}