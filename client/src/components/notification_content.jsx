import { BellOff, BellDot } from 'lucide-react';

export function NotificationContent() {
    return (
        <>  
            <div className='flex flex-col h-full'>
                <div className="flex flex-col border-b border-neutral-700 pb-4">
                    <h1 className="text-3xl font-bold text-white mb-1 px-6 pt-6">Thông báo</h1>
                    <h2 className="text-base text-neutral-400 px-6">Các thông báo mới nhất sẽ hiện ở đây</h2>
                </div>
                <div className='flex flex-col justify-center items-center flex-1 mb-20 gap-3'>
                    <BellOff size={64} className="text-neutral-600 mx-auto" />
                    <p className="text-xl text-neutral-300 py-px font-semibold">Hiện tại bạn chưa có thông báo nào</p>
                </div>
            </div>
        </>
    )
}