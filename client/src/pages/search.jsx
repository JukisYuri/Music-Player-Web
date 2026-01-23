import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Music, Heart, User, Search as SearchIcon } from 'lucide-react';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { useMusic } from '../context/MusicContext.jsx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth_context.jsx';
import axios from 'axios';

const removeVietnameseTones = (str) => {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
};

const getRandomColor = () => {
    const colors = ["from-blue-600 to-purple-600", "from-green-600 to-teal-600", "from-rose-600 to-orange-600", "from-yellow-500 to-red-600", "from-gray-600 to-slate-800"];
    return colors[Math.floor(Math.random() * colors.length)];
};

export function Search() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';

    const { playSong, currentSong } = useMusic();

    const [results, setResults] = useState({ songs: [], artists: [], albums: [], users: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [likedSongs, setLikedSongs] = useState(new Set());

    useEffect(() => {
        const fetchDataAndSearch = async () => {
            setIsLoading(true);

            // Reset kết quả nếu không có query
            if (!query.trim()) {
                setResults({ songs: [], artists: [], albums: [], users: [] });
                setIsLoading(false);
                return;
            }

            const lowerQuery = query.toLowerCase();
            const unsignedQuery = removeVietnameseTones(lowerQuery); // Từ khóa không dấu
            const token = localStorage.getItem('token');

            let matchedSongs = [];
            let usersData = [];

            // 1. TÌM BÀI HÁT (Fetch riêng để không bị ảnh hưởng bởi lỗi User)
            try {
                const localSongsRes = await fetch(`http://127.0.0.1:8000/api/music/local-songs/`);
                if (localSongsRes.ok) {
                    const allSongs = await localSongsRes.json();

                    matchedSongs = allSongs.filter(song => {
                        const title = song.title.toLowerCase();
                        const artist = song.artist.toLowerCase();
                        const unsignedTitle = removeVietnameseTones(title);
                        const unsignedArtist = removeVietnameseTones(artist);

                        return title.includes(lowerQuery) ||
                               artist.includes(lowerQuery) ||
                               unsignedTitle.includes(unsignedQuery) ||
                               unsignedArtist.includes(unsignedQuery);
                    });
                }
            } catch (err) {
                console.error("Lỗi tìm bài hát:", err);
            }

            // 2. TÌM USER
            try {
                const userSearchRes = await axios.get(`http://127.0.0.1:8000/api/user/search/?q=${query}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                usersData = userSearchRes.data || [];
            } catch (err) {
                console.warn("Lỗi tìm user (có thể do chưa login hoặc token hết hạn):", err);
                // Không throw error để code tiếp tục chạy hiển thị bài hát
            }

            // 3. XỬ LÝ DỮ LIỆU PHỤ (Nghệ sĩ, Album) TỪ BÀI HÁT TÌM ĐƯỢC
            const uniqueArtists = [...new Set(matchedSongs.map(s => s.artist))].map(artist => ({
                name: artist,
                type: 'Nghệ sĩ',
                cover: matchedSongs.find(s => s.artist === artist)?.cover
            }));

            const uniqueAlbums = [...new Set(matchedSongs.map(s => s.album || `Tuyển tập ${s.artist}`))].map(albumName => ({
                title: albumName,
                artist: matchedSongs.find(s => (s.album || `Tuyển tập ${s.artist}`) === albumName)?.artist,
                cover: matchedSongs.find(s => (s.album || `Tuyển tập ${s.artist}`) === albumName)?.cover,
                color: getRandomColor()
            }));

            setResults({
                songs: matchedSongs,
                artists: uniqueArtists,
                albums: uniqueAlbums,
                users: usersData
            });

            setIsLoading(false);
        };

        fetchDataAndSearch();
    }, [query]);

    const handlePlaySong = (song) => {
        playSong(song);
    };

    const handleFollow = async (targetUsername) => {
        try {
            if (!user) {
                alert("Bạn cần đăng nhập để theo dõi người khác!");
                return;
            }
            const token = localStorage.getItem('token');
            setResults(prev => ({
                ...prev,
                users: prev.users.map(u =>
                    u.username === targetUsername
                    ? { ...u, is_following: !u.is_following }
                    : u
                )
            }));
            await axios.post(`http://127.0.0.1:8000/api/user/follow/${targetUsername}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Lỗi follow:", error);
            alert("Có lỗi xảy ra khi theo dõi");
        }
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <HeaderBar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 ml-64 pt-20 pb-32 overflow-y-auto min-h-screen">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {t('search.results_for', { query })}
                        </h1>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 text-neutral-500">
                            {t('search.is_researching')}
                        </div>
                    ) : (results.songs.length === 0 && results.artists.length === 0 && results.users.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
                            <SearchIcon size={64} className="mb-4 opacity-50"/>
                            <p className="text-xl font-semibold">{t('search.not_found', {query})}</p>
                            <p className="text-base mt-2">{t('search.try_different')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10">

                            {/* 1. KẾT QUẢ HÀNG ĐẦU */}
                            {results.songs.length > 0 && (
                                <section className="flex gap-6">
                                    <div className="w-full md:w-2/5">
                                        <h2 className="text-2xl font-bold mb-4">{t('search.top_results')}</h2>
                                        <div
                                            onClick={() => handlePlaySong(results.songs[0])}
                                            className="group bg-neutral-900 p-6 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer relative"
                                        >
                                            <div className="w-24 h-24 mb-4 rounded-full overflow-hidden shadow-lg relative">
                                                {/* SỬA LẠI LOGIC HIỂN THỊ ẢNH: Chấp nhận mọi loại ảnh */}
                                                {results.songs[0].cover ? (
                                                    <img src={results.songs[0].cover} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="bg-neutral-700 w-full h-full flex items-center justify-center"><Music/></div>
                                                )}
                                            </div>
                                            <h3 className="text-3xl font-bold mb-1 line-clamp-1">{results.songs[0].title}</h3>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded-full uppercase font-bold">Bài hát</span>
                                                <span>{results.songs[0].artist}</span>
                                            </div>
                                            <div className="absolute bottom-6 right-6 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105">
                                                <Play size={24} fill="black" className="ml-1 text-black"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danh sách bài hát */}
                                    <div className="w-full md:w-3/5">
                                        <h2 className="text-2xl font-bold mb-4">{t('search.songs')}</h2>
                                        <div className="flex flex-col">
                                            {results.songs.slice(0, 4).map((song) => (
                                                <div key={song.id} onClick={() => handlePlaySong(song)} className="group flex items-center justify-between p-2 rounded-md hover:bg-neutral-800 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 relative shrink-0">
                                                            {song.cover ? <img src={song.cover} className="w-full h-full object-cover rounded"/> : <div className="bg-neutral-700 w-full h-full rounded flex items-center justify-center"><Music size={16}/></div>}
                                                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded">
                                                                <Play size={16} fill="white"/>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium line-clamp-1 ${currentSong.title === song.title ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                                                            <p className="text-sm text-neutral-400 line-clamp-1">{song.artist}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-neutral-400 text-sm">
                                                        <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}>
                                                            <Heart size={16} fill={likedSongs.has(song.id) ? "currentColor" : "none"} className={likedSongs.has(song.id) ? "text-green-500" : "hover:text-white"}/>
                                                        </button>
                                                        <span>{song.duration}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* 2. USERS */}
                            {results.users.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-4">Người dùng</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {results.users.map((u) => (
                                            <div key={u.id} className="bg-neutral-900/50 p-4 rounded-xl hover:bg-neutral-800 transition-colors flex flex-col items-center group relative cursor-pointer"
                                                onClick={() => navigate(`/profile/${u.username}`)}
                                            >
                                                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-neutral-800 group-hover:border-neutral-600 transition-colors">
                                                    {u.profile_image_url ? (
                                                        <img src={`${u.profile_image_url}`} alt={u.username} className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <div className="bg-neutral-700 w-full h-full flex items-center justify-center">
                                                            <User size={48} className="text-neutral-400"/>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-center truncate w-full px-2">{u.display_name || u.username}</h3>
                                                <p className="text-sm text-neutral-400 text-center mb-4">@{u.username}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFollow(u.username);
                                                    }}
                                                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all transform active:scale-95 cursor-pointer ${
                                                        u.is_following 
                                                        ? 'bg-transparent border border-neutral-500 text-white hover:border-white' 
                                                        : 'bg-white text-black hover:bg-neutral-200'
                                                    }`}
                                                >
                                                    {u.is_following ? 'Đang theo dõi' : 'Theo dõi'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 3. NGHỆ SĨ */}
                            {results.artists.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-4">{t('search.artists')}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {results.artists.map((artist, idx) => (
                                            <div key={idx} className="bg-neutral-900/50 p-4 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer group">
                                                <div className="aspect-square rounded-full overflow-hidden mb-4 shadow-lg mx-auto w-32 h-32 relative">
                                                    {artist.cover ? <img src={artist.cover} className="w-full h-full object-cover"/> : <div className="bg-neutral-700 w-full h-full flex items-center justify-center"><User size={40}/></div>}
                                                </div>
                                                <h3 className="font-bold text-center truncate">{artist.name}</h3>
                                                <p className="text-sm text-neutral-400 text-center">{t('search.artists')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 4. ALBUMS */}
                            {results.albums.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-4">Album</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {results.albums.map((album, idx) => (
                                            <div key={idx} className="bg-neutral-900/50 p-4 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer group">
                                                <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-lg relative bg-linear-to-br from-gray-700 to-gray-900">
                                                    {/* SỬA LẠI: Chấp nhận mọi loại link ảnh */}
                                                    {album.cover ? (
                                                        <img src={album.cover} className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <div className={`w-full h-full bg-linear-to-br ${album.color}`}></div>
                                                    )}
                                                    <div className="absolute right-2 bottom-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                        <Play size={20} fill="black" className="ml-1 text-black"/>
                                                    </div>
                                                </div>
                                                <h3 className="font-bold truncate">{album.title}</h3>
                                                <p className="text-sm text-neutral-400 truncate">{album.artist} • Album</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}