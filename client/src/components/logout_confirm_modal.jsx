import {LogOut, X} from 'lucide-react';
import {Link} from "react-router-dom";

/**
 * LogoutConfirmModal: Hộp thoại xác nhận đăng xuất tùy chỉnh.
 * @param {boolean} isOpen - Trạng thái Modal (mở/đóng).
 * @param {function} onClose - Hàm đóng Modal (khi hủy).
 * @param {function} onConfirm - Hàm xử lý logic đăng xuất (khi xác nhận).
 */
export function LogoutConfirmModal({isOpen, onClose, onConfirm}) {

    const overlayClass = `
        fixed inset-0 z-50 flex justify-center items-center
        transition-opacity duration-300
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
    `;

    const modalBoxClass = `
        bg-neutral-800 rounded-xl shadow-2xl w-full max-w-sm p-6 
        transform transition-all duration-300
        ${isOpen ? 'scale-100' : 'scale-90'}
    `;

    return (
        <div className={overlayClass}>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            ></div>

            <div className={modalBoxClass} style={{zIndex: 51}}>

                <div className="flex justify-between items-center border-b border-neutral-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <LogOut size={24} className="text-red-500 mr-2"/>
                        Xác nhận Đăng xuất
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700"
                        aria-label="Đóng"
                    >
                        <X size={20}/>
                    </button>
                </div>

                <p className="text-neutral-300 mb-6">
                    Bạn có chắc chắn muốn đăng xuất khỏi Music Player không? Bạn sẽ cần phải đăng nhập lại để tiếp tục
                    nghe nhạc.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors cursor-pointer"
                    >
                        Hủy
                    </button>
                    <Link to="/login">
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            Đăng xuất
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}