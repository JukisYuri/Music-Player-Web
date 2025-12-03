import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ForgotPassword } from './pages/Forgot-Password.jsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import { Profile } from './pages/Profile.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/profile" replace />} />
      
      {/* Định nghĩa đường dẫn */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App
