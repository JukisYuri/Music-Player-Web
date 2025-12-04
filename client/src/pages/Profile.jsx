import { LeftSideBar } from '../components/leftsidebar.jsx';
import { ProfileContent } from '../components/profile_content.jsx';

export function Profile() {
    return (
        <div className="w-screen h-screen grid grid-cols-12">
            <div className="col-span-2">
                <LeftSideBar />
            </div>

            <div className="col-span-10">
                <ProfileContent />
            </div>
        </div>
    )
}