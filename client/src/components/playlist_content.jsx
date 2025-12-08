import { PlaylistTracks } from './playlist_and_album.jsx';

const albums = [
    { id: 1, title: "Sky Tour 2019", artist: "Sơn Tùng M-TP", color: "from-blue-600 to-purple-600" },
    { id: 2, title: "Lofi Chill 2024", artist: "Various Artists", color: "from-green-600 to-teal-600" },
    { id: 3, title: "V-Pop Ballad", artist: "Tuyển Tập", color: "from-rose-600 to-orange-600" },
    { id: 4, title: "Rap Việt Mùa 3", artist: "Rap Việt", color: "from-yellow-500 to-red-600" },
    { id: 5, title: "Indie Buồn", artist: "Vũ., Chillies", color: "from-gray-600 to-slate-800" }
];

export function PlaylistContent() {
    return (
        <section className='flex flex-col px-8 py-3 space-y-6'>
            <PlaylistTracks albums={albums} />
        </section>
    )
}