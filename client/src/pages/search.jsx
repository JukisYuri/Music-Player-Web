import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Clock, Music, Heart, PlusCircle, User, Disc, Search as SearchIcon } from 'lucide-react';
import { HeaderBar } from '../components/header_bar.jsx';
import { Sidebar } from '../components/sidebar.jsx';
import { PlayerBar } from '../components/player_bar.jsx';
import { useTranslation } from 'react-i18next';

const getRandomColor = () => {
    const colors = ["from-blue-600 to-purple-600", "from-green-600 to-teal-600", "from-rose-600 to-orange-600", "from-yellow-500 to-red-600", "from-gray-600 to-slate-800"];
    return colors[Math.floor(Math.random() * colors.length)];
};

export function Search() {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || ''; // Lấy từ khóa từ URL

    // Data States
    const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
    const [isLoading, setIsLoading] = useState(true);

    // Player States
    const [currentSong, setCurrentSong] = useState({ title: "Sẵn sàng", artist: "Chọn bài hát...", audioUrl: "", cover: "" });
    const [isPlaying, setIsPlaying] = useState(false);
    const [likedSongs, setLikedSongs] = useState(new Set());

    // --- LOGIC TÌM KIẾM ---
    useEffect(() => {
        const fetchDataAndSearch = async () => {
            setIsLoading(true);
            try {
                // 1. Lấy toàn bộ bài hát
                const res = await fetch(`http://127.0.0.1:8000/api/music/local-songs/`);
                const allSongs = await res.json();

                if (!query) {
                    setResults({ songs: [], artists: [], albums: [] });
                    setIsLoading(false);
                    return;
                }

                const lowerQuery = query.toLowerCase();

                // 2. Lọc Bài hát
                const matchedSongs = allSongs.filter(song =>
                    song.title.toLowerCase().includes(lowerQuery) ||
                    song.artist.toLowerCase().includes(lowerQuery)
                );

                // 3. Lọc Nghệ sĩ
                const uniqueArtists = [...new Set(matchedSongs.map(s => s.artist))].map(artist => ({
                    name: artist,
                    type: 'Nghệ sĩ',
                    cover: matchedSongs.find(s => s.artist === artist)?.cover
                }));

                // 4. Lọc Album
                const uniqueAlbums = [...new Set(matchedSongs.map(s => s.album || `Tuyển tập ${s.artist}`))].map(albumName => ({
                    title: albumName,
                    artist: matchedSongs.find(s => (s.album || `Tuyển tập ${s.artist}`) === albumName)?.artist,
                    cover: matchedSongs.find(s => (s.album || `Tuyển tập ${s.artist}`) === albumName)?.cover,
                    color: getRandomColor()
                }));

                setResults({
                    songs: matchedSongs,
                    artists: uniqueArtists,
                    albums: uniqueAlbums
                });

            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataAndSearch();
    }, [query]);

    const handlePlaySong = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
        fetch(`http://127.0.0.1:8000/api/music/view/${song.id}/`, {
            method: 'POST'
        });
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
            <HeaderBar username="Oleny" />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 ml-64 pt-20 pb-32 overflow-y-auto min-h-screen">

                    {/* Kết quả tìm kiếm Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {t('search.results_for', { query })}
                        </h1>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 text-neutral-500">
                            {t('search.is_researching')}
                        </div>
                    ) : results.songs.length === 0 && results.artists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
                            <SearchIcon size={64} className="mb-4 opacity-50"/>
                            <p className="text-xl font-semibold">{t('search.not_found', {query})}</p>
                            <p className="text-base mt-2">{t('search.try_different')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10">

                            {/* 1. KẾT QUẢ HÀNG ĐẦU (Top Result) */}
                            {results.songs.length > 0 && (
                                <section className="flex gap-6">
                                    <div className="w-full md:w-2/5">
                                        <h2 className="text-2xl font-bold mb-4">{t('search.top_results')}</h2>
                                        <div
                                            onClick={() => handlePlaySong(results.songs[0])}
                                            className="group bg-neutral-900 p-6 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer relative"
                                        >
                                            <div className="w-24 h-24 mb-4 rounded-full overflow-hidden shadow-lg relative">
                                                {results.songs[0].cover ? <img src={results.songs[0].cover} className="w-full h-full object-cover"/> : <div className="bg-neutral-700 w-full h-full flex items-center justify-center"><Music/></div>}
                                            </div>
                                            <h3 className="text-3xl font-bold mb-1 line-clamp-1">{results.songs[0].title}</h3>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded-full uppercase font-bold">Bài hát</span>
                                                <span>{results.songs[0].artist}</span>
                                            </div>

                                            {/* Nút Play to */}
                                            <div className="absolute bottom-6 right-6 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105">
                                                <Play size={24} fill="black" className="ml-1 text-black"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danh sách bài hát (Bên phải Top Result) */}
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

                            {/* 2. NGHỆ SĨ */}
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

                            {/* 3. ALBUMS */}
                            {results.albums.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-4">Album</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {results.albums.map((album, idx) => (
                                            <div key={idx} className="bg-neutral-900/50 p-4 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer group">
                                                <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-lg relative bg-linear-to-br from-gray-700 to-gray-900">
                                                    {album.cover && album.cover.startsWith('data:') ? (
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

            <PlayerBar
                currentSong={currentSong.title}
                artist={currentSong.artist}
                audioUrl={currentSong.audioUrl}
                cover={currentSong.cover}
                onPlayingChange={setIsPlaying}
                playlist={results.songs}
                onPlaySong={handlePlaySong}
            />
        </div>
    );
}