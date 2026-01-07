import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth_context.jsx';

// Component để bảo vệ các route chỉ dành cho người dùng chưa đăng nhập
const GuessRoute = () => {
    const { user } = useAuth()
    if (user) {
        return Navigate({ to: '/index' });
    }
    return <Outlet />;
}

export default GuessRoute;