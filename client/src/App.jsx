import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ForgotPassword } from './pages/Forgot-Password.jsx'
import { Index } from './pages/Index.jsx'
import {Routes, Route, Navigate, useLocation} from 'react-router-dom';
import { Profile } from './pages/Profile.jsx';
import { OnBoarding } from './pages/Onboarding.jsx';
import { Playlist } from './pages/Playlist.jsx';
import { Setting } from './pages/Setting.jsx';
import { Notification } from './pages/Notification.jsx';
import { AlbumDetail} from "./pages/AlbumDetail.jsx";
import { Search} from "./pages/search.jsx";
import { PlayerBar } from './components/player_bar.jsx';
import { MusicProvider, useMusic } from './context/MusicContext.jsx';
import { SongDetail } from "./pages/SongDetail.jsx";
import {PlaylistLibrary} from "./pages/PlaylistLibrary.jsx";
import {ArtistDetail} from "./pages/ArtistDetail.jsx";
import GuessRoute from './context/guess_route.jsx';
import {DiscoveryMusic} from "./pages/DiscoveryMusic.jsx";
import {GenresMusic} from "./pages/GenresMusic.jsx";
import {ChartsMusic} from "./pages/ChartMusic.jsx";

const GlobalPlayer = () => {
    const { currentSong, isPlaying, setIsPlaying, playlist, handleNext, handlePrev, playSong, removeFromQueue } = useMusic();

    const location = useLocation();

    const hiddenRoutes = ['/login', '/register', '/onboarding', '/forgot-password'];

    if (hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    if (!currentSong.audioUrl) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <PlayerBar
                currentSong={currentSong.title}
                artist={currentSong.artist}
                audioUrl={currentSong.audioUrl}
                cover={currentSong.cover}
                onNext={handleNext}
                onPrev={handlePrev}
                onPlayingChange={(status) => setIsPlaying(status)}
                playlist={playlist}
                onRemoveFromQueue={removeFromQueue}
                onPlaySong={(song) => playSong(song)}
                forceIsPlaying={isPlaying}
            />
        </div>
    );
};


function App() {
  return (
    <MusicProvider>
        <div className="relative min-h-screen bg-neutral-950 text-white">
            <Routes>
                <Route path="/" element={<Navigate to="/index" replace />} />

                {/* Định nghĩa đường dẫn */}
                <Route element={<GuessRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
                <Route path="/index" element={<Index />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/onboarding" element={<OnBoarding />} />
                <Route path="/playlist" element={<PlaylistLibrary/>} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/setting" element={<Setting/>} />
                <Route path="/notification" element={<Notification/>} />
                <Route path="/search" element={<Search />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/artist/:id" element={<ArtistDetail />} />
                <Route path="/discover" element={<DiscoveryMusic />} />
                <Route path="/charts" element={<ChartsMusic />} />
                <Route path="/genres" element={<GenresMusic />} />
                {/* Route dành cho chính mình (URL: /profile) */}
                <Route path="/profile" element={<Profile />} />
                {/* Route dành cho xem người khác (URL: /profile/mizu) */}
                <Route path="/profile/:username" element={<Profile />} />
            </Routes>

            <GlobalPlayer />
        </div>
    </MusicProvider>
  )
}

export default App
