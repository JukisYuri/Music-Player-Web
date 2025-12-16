import { KeyRound, RotateCcwKey, AtSign, ShieldCheck } from 'lucide-react';

export function ForgotPasswordInput({ step = 'form', newPassword, confirmNewPassword, setNewPassword, setConfirmNewPassword, isMatchWithoutLength }) {
    const isOtpStep = step === 'otp'

    return (
        <>
            {/* INPUT EMAIL */}
            <div className="flex flex-col gap-1.5 mx-8">
                <label className={`text-sm font-medium ml-1 flex flex-row gap-1 items-center transition-all duration-500 ease-in-out
                    ${isOtpStep ? 'text-green-200 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'text-neutral-300'}`}><AtSign  size={16} />Email</label>
                <input 
                    type="text"
                    readOnly={isOtpStep}
                    tabIndex={isOtpStep ? -1 : 0}
                    className={`w-full bg-neutral-800/50 border rounded-[5px] py-3.5 pl-2 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all duration-500
                        ${isOtpStep 
                            ? 'border-green-500 ring-1 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-not-allowed' 
                            : 'border-neutral-700/50 focus:border-green-500/50 focus:ring-green-500/50'
                        }`}
                    placeholder="Nhập Email đã đăng ký" 
                    required
                />
            </div>

            {/* INPUT PASSWORD */}
            <div className={`flex flex-col gap-3 transition-all duration-500 ease-in-out overflow-hidden mx-8 ${isOtpStep ? 'max-h-0 opacity-0 -translate-y-4' : 'max-h-[500px] opacity-100 translate-y-0'}`}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><KeyRound size={16}/> Mật Khẩu Mới</label>
                    <div className="relative">
                        <input 
                            type="password"
                            minLength={8}
                            maxLength={32}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all 
                                ${!isMatchWithoutLength && confirmNewPassword.length > 0 ? 'border-red-500' : ''}`}
                            placeholder="Mật khẩu phải từ 8-32 ký tự" 
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-300 ml-1 flex flex-row gap-1 items-center"><RotateCcwKey size={16}/> Nhập Lại Mật Khẩu Mới</label>
                    <div className="relative">
                        <input 
                            type="password"
                            minLength={8}
                            maxLength={32}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
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
                        <ShieldCheck size={16}/> Mã Xác Nhận (OTP)
                    </label>
                    <div className="relative">
                        <input 
                            type="text"
                            maxLength={6}
                            className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-[5px] py-3.5 pl-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                            placeholder='Nhập mã 6 số OTP'
                            required={isOtpStep}
                            autoFocus={isOtpStep}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}