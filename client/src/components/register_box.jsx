import { KeyRound, AtSign, RotateCcwKey, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RegisterInput({ step = 'form', email, setEmail, password, confirmPassword, setPassword, setConfirmPassword, isMatchWithoutLength, otp, setOtp }) {
    const isOtpStep = step === 'otp'
    const { t } = useTranslation();

    // Hàm kiểm tra OTP chỉ cho phép nhập số
    const checkOtp = (e) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số
        const numericValue = value.replace(/[^0-9]/g, '');
        e.target.value = numericValue;
        setOtp(numericValue);
    }

    return (
        <>
            {/* INPUT EMAIL */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className={`text-sm font-medium ml-1 flex flex-row gap-1 items-center transition-all duration-500 ease-in-out
                    ${isOtpStep ? 'text-green-200 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'text-neutral-300'}`}><AtSign  size={16} />Email</label>
                <input 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // Logic class chuyển trạng thái khi đang ở bước OTP
                    readOnly={isOtpStep}
                    tabIndex={isOtpStep ? -1 : 0}
                    className={`w-full bg-neutral-800/50 border rounded-[5px] py-3.5 pl-2 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all duration-500
                        ${isOtpStep 
                            ? 'border-green-500 ring-1 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-not-allowed' 
                            : 'border-neutral-700/50 focus:border-green-500/50 focus:ring-green-500/50'
                        }`}
                    placeholder={t('register.email_placeholder')}
                    required
                />
            </div>
            
            <div className={`flex flex-col gap-3 transition-all duration-500 ease-in-out overflow-hidden mx-8 ${isOtpStep ? 'max-h-0 opacity-0 -translate-y-4' : 'max-h-[500px] opacity-100 translate-y-0'}`}>
                {/* INPUT PASSWORD */}
                {/* relative div bao quanh input và button và absolute top-1/2 -translate-y-1/2 */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><KeyRound size={16}/> {t('register.password_label')}</label>
                    <div className="relative">
                        <input 
                            type="password"
                            minLength={8}
                            maxLength={32}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all 
                                ${!isMatchWithoutLength && confirmPassword.length > 0 ? 'border-red-500' : ''}`}
                            placeholder={t('register.password_placeholder')} 
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><RotateCcwKey size={16}/> {t('register.confirm_password_label')}</label>
                    <div className="relative">
                        <input 
                            type="password"
                            minLength={8}
                            maxLength={32}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                            placeholder="*********" 
                            required
                        />
                    </div>
                </div>
            </div>

            {/* INPUT OTP */}
            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isOtpStep ? 'max-h-[200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}`}>
                <div className="flex flex-col gap-1.5 mx-8">
                    <label className="text-sm font-medium text-green-200 ml-1 flex flex-row gap-1 items-center">
                        <ShieldCheck size={16}/> {t('register.otp_label')}
                    </label>
                    <div className="relative">
                        <input 
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={checkOtp}
                            className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                            placeholder={t('register.otp_placeholder')}
                            required={isOtpStep}
                            autoFocus={isOtpStep}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}