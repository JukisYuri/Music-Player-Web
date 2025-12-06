import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ForgotPassword } from './pages/Forgot-Password.jsx'
import { Index } from './pages/Index.jsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import { Profile } from './pages/Profile.jsx';
import { OnBoarding } from './pages/Onboarding.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/index" replace />} />
      
      {/* Định nghĩa đường dẫn */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/index" element={<Index />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/onboarding" element={<OnBoarding />} />
    </Routes>
  )
}

export default App
