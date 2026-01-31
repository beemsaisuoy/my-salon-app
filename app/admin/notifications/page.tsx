'use client';

import { useEffect, useState } from 'react';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    Notification
} from '@/lib/notifications';
import { getTimeAgo } from '@/lib/firestore';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking_new': return '📅';
            case 'order_new': return '🛒';
            case 'product_low_stock': return '⚠️';
            case 'booking_today': return '📌';
            case 'order_pending_long': return '⏰';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'booking_new': return 'border-blue-400 bg-blue-50';
            case 'order_new': return 'border-green-400 bg-green-50';
            case 'product_low_stock': return 'border-orange-400 bg-orange-50';
            case 'booking_today': return 'border-purple-400 bg-purple-50';
            case 'order_pending_long': return 'border-red-400 bg-red-50';
            default: return 'border-pink-400 bg-pink-50';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-kanit text-2xl font-bold text-gray-800">🔔 แจ้งเตือน</h1>
                    <p className="text-gray-500">
                        {unreadCount > 0 ? `มี ${unreadCount} รายการที่ยังไม่อ่าน` : 'ไม่มีรายการใหม่'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="btn-outline text-sm"
                    >
                        ✓ อ่านทั้งหมด
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['all', 'unread', 'read'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab
                                ? 'bg-pink-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab === 'all' && 'ทั้งหมด'}
                        {tab === 'unread' && 'ยังไม่อ่าน'}
                        {tab === 'read' && 'อ่านแล้ว'}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        <span className="text-5xl">📭</span>
                        <p className="mt-4">ไม่มีแจ้งเตือน</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => !notification.isRead && handleMarkAsRead(notification.id!)}
                            className={`card p-4 cursor-pointer transition-all hover:shadow-lg ${notification.isRead
                                    ? 'bg-white'
                                    : `border-l-4 ${getNotificationColor(notification.type)}`
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="text-3xl">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-gray-700 ${!notification.isRead ? 'font-medium' : ''}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {getTimeAgo(notification.createdAt)}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-3 h-3 bg-pink-primary rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
