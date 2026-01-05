import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hàm gọi API lấy thông tin mới nhất
    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:8000/api/user/me/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data); // Cập nhật user vào kho
        } catch (error) {
            console.error("Lỗi auth:", error);
            localStorage.removeItem('token'); // Token lỗi thì xóa luôn
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Tự động chạy khi F5 trang
    useEffect(() => {
        fetchUser();
    }, []);

    // Hàm Login (Dùng khi Login Google xong)
    const login = (token, newUserInfo) => {
        localStorage.setItem('token', token);
        if (newUserInfo) {
            setUser(newUserInfo);
        } else {
            fetchUser();
        }
    };

    // Hàm Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Tạo custom hook để sử dụng dễ dàng hơn
export const useAuth = () => useContext(AuthContext);