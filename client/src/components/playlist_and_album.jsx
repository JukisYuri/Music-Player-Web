import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PlaylistTracks({ albums, onPlayAlbum }) {
    const navigate = useNavigate();

    const handleAlbumClick = (artistName) => {
        navigate(`/album/${encodeURIComponent(artistName)}`);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((album) => (
                <div
                    key={album.id}
                    onClick={() => handleAlbumClick(album.artist)}
                    className="group relative bg-neutral-800/40 hover:bg-neutral-800 p-4 rounded-xl transition-all duration-300 cursor-pointer"
                >
                    <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                        {album.cover && album.cover.startsWith("data:") ? (
                            <img src={album.cover} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className={`w-full h-full bg-linear-to-br ${album.color}`}></div>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); onPlayAlbum(album); }}
                            className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-green-400"
                        >
                            <Play size={24} fill="currentColor" className="text-black ml-1" />
                        </button>
                    </div>
                    <h3 className="font-bold text-white truncate mb-1">{album.title}</h3>
                    <p className="text-sm text-neutral-400 line-clamp-2">{album.artist}</p>
                </div>
            ))}
        </div>
    );
}