'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUnreadNotificationCount } from '@/lib/notifications';

export default function NotificationBell() {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        };

        fetchCount();

        // Refresh every 30 seconds
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <button
            onClick={() => router.push('/admin/notifications')}
            className="relative p-2 hover:bg-pink-50 rounded-full transition-colors"
        >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
                <span className="notification-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}
