import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';
import { useState, useEffect } from 'react';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            const pData = (user as any)?.profile_data || {};
            const isRemoved = pData.photo_removed || (pData.avatar_url === null && pData.photo === null && pData.avatar === null && !(user as any)?.avatar_url);
            if (isRemoved) {
                localStorage.removeItem(`user_profile_image_${user.id}`);
                setProfileImage(null);
                return;
            }
            const serverPhoto = (user as any)?.avatar_url || pData.avatar_url || pData.photo || pData.avatar || user.avatar;
            if (serverPhoto) {
                setProfileImage(serverPhoto);
            } else {
                const savedData = localStorage.getItem(`user_profile_data_${user.id}`);
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        if (parsed && parsed.email && parsed.email.toLowerCase() !== user.email.toLowerCase()) {
                            localStorage.removeItem(`user_profile_data_${user.id}`);
                            localStorage.removeItem(`user_profile_image_${user.id}`);
                            setProfileImage(null);
                            return;
                        }
                    } catch (e) {}
                }
                setProfileImage(localStorage.getItem(`user_profile_image_${user.id}`));
            }
        }
    }, [user]);

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={profileImage || user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
