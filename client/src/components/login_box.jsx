import { Eye, EyeOff, CircleUser, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoginInput({ showPassword, setShowPassword }) {
    const { t } = useTranslation();
    return (
        <>
            {/* INPUT EMAIL */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><CircleUser size={16} />{t('login.email_label')}</label>
                <input 
                    type="text" 
                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-2 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    placeholder={t('login.email_placeholder')}
                    required
                />
            </div>

            {/* INPUT PASSWORD */}
            {/* relative div bao quanh input và button và absolute top-1/2 -translate-y-1/2 */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><KeyRound size={16}/> {t('login.password_label')}</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                        placeholder="*********" 
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
            </div>
        </>
    )
}