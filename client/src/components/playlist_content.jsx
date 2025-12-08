import { AnimatePresence } from 'framer-motion';
import { PlaylistTracks } from './playlist_and_album.jsx';
import { AlbumDetailView } from './album_detail.jsx';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from "lucide-react";

const albums = [
    { id: 1, title: "Danh Sách 1", color: "from-blue-600 to-purple-600" },
    { id: 2, title: "Danh Sách 2", color: "from-green-600 to-teal-600" },
    { id: 3, title: "Danh Sách 3", color: "from-rose-600 to-orange-600" },
    { id: 4, title: "Danh Sách 4", color: "from-yellow-500 to-red-600" },
    { id: 5, title: "Danh Sách 5", color: "from-gray-600 to-slate-800" }
];

export function PlaylistContent() {
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    return (
        <section className='flex flex-col px-8 py-4 h-[calc(100vh-160px)]'>
            <div className="shrink-0 mb-6 min-h-10 flex items-center justify-between">
                <h2 className='text-2xl font-bold text-white'>
                    {selectedAlbum ? 'Chi tiết Playlist' : 'Danh sách phát của bạn'}
                </h2>
                
                {selectedAlbum && (
                    <button 
                        onClick={() => setSelectedAlbum(null)} // Sửa cú pháp onClick
                        className="py-2 px-4 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm">
                        <ArrowLeft size={16} /> Quay lại danh sách
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                    
                    {!selectedAlbum ? (
                        // trạng thái hiện danh sách album
                        <motion.div
                            key="grid-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full">
                            <PlaylistTracks 
                                albums={albums} 
                                onAlbumClick={setSelectedAlbum} />
                        </motion.div>
                    ) : (
                        // trạng thái hiện chi tiết album
                        <motion.div
                            key="detail-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full">
                            <AlbumDetailView 
                                album={selectedAlbum}  />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </section>
    )
}