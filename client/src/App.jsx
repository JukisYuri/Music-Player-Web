import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ForgotPassword } from './pages/Forgot-Password.jsx'
import { Index } from './pages/Index.jsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import { Profile } from './pages/Profile.jsx';
import { OnBoarding } from './pages/Onboarding.jsx';
import { Playlist } from './pages/Playlist.jsx';
import { Setting } from './pages/Setting.jsx';
import { Notification } from './pages/Notification.jsx';
import { AlbumDetail} from "./pages/AlbumDetail.jsx";
import { Search} from "./pages/search.jsx";
import GuessRoute from './context/guess_route.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/index" replace />} />
      
      {/* Định nghĩa đường dẫn */}
      <Route path="/index" element={<Index />} />
      <Route path="/album/:artistName" element={<AlbumDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/playlist" element={<Playlist/>} />
      <Route path="/setting" element={<Setting/>} />
      <Route path="/notification" element={<Notification/>} />
      <Route path="/search" element={<Search />} />
      <Route element={<GuessRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/onboarding" element={<OnBoarding />} />
    </Routes>
  )
}

export default App
