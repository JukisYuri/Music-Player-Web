import { Music, Play } from "lucide-react";
import { motion } from "framer-motion";

export function PlaylistTracks({albums = [], onAlbumClick}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {albums.map((album) => (
                <motion.div 
                    whileHover={{ y: -5 }}
                    key={album.id} 
                    onClick={() => onAlbumClick(album)}
                    className="group bg-neutral-900/40 p-4 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
                >
                    <div className={`aspect-square w-full rounded-lg mb-4 shadow-lg bg-linear-to-br ${album.color} flex items-center justify-center relative overflow-hidden group-hover:shadow-green-900/20 transition-all`}>
                        <Music size={48} className="text-white/50 group-hover:scale-110 transition-transform duration-300"/>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer">
                                <Play size={24} fill="currentColor" className="ml-1"/>
                            </button>
                        </div>
                    </div>
                    <h3 className="font-bold text-white text-base truncate mb-1 group-hover:text-green-400 transition-colors">{album.title}</h3>
                    <p className="text-sm text-neutral-400 line-clamp-2">{album.artist || "Nghệ sĩ chưa cập nhật"}</p>
                </motion.div>
            ))}
        </div>
    )
}