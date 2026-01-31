'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookings, getOrders, getProducts, Booking, Order, Product, isToday, getTimeAgo } from '@/lib/firestore';
import { getNotifications, getUnreadNotificationCount, checkBookingTodayNotification, Notification } from '@/lib/notifications';
import RevenueChart from '@/components/charts/RevenueChart';

interface Stats {
    todayBookings: number;
    todayOrders: number;
    todayRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    unreadNotifications: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        todayBookings: 0,
        todayOrders: 0,
        todayRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        unreadNotifications: 0,
    });
    const [recentActivity, setRecentActivity] = useState<Notification[]>([]);
    const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookings, orders, products, notifications, unreadCount] = await Promise.all([
                    getBookings(),
                    getOrders(),
                    getProducts(),
                    getNotifications(),
                    getUnreadNotificationCount(),
                ]);

                // Calculate today's stats
                const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;
                const todayOrders = orders.filter(o => isToday(o.createdAt)).length;
                const todayRevenue = orders
                    .filter(o => isToday(o.createdAt))
                    .reduce((sum, o) => sum + o.total, 0);

                // Unique customers
                const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

                setStats({
                    todayBookings,
                    todayOrders,
                    todayRevenue,
                    totalCustomers: uniqueCustomers,
                    totalProducts: products.length,
                    unreadNotifications: unreadCount,
                });

                // Recent activity (latest 5)
                setRecentActivity(notifications.slice(0, 5));

                // Check for booking today notification
                if (todayBookings > 0) {
                    await checkBookingTodayNotification(todayBookings);
                }

                // Prepare revenue data for last 7 days
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayOrders = orders.filter(o => {
                        const orderDate = o.createdAt?.toDate().toISOString().split('T')[0];
                        return orderDate === dateStr;
                    });
                    const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
                    last7Days.push({
                        label: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
                        value: revenue,
                    });
                }
                setRevenueData(last7Days);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
            <div>
                <h1 className="font-kanit text-2xl font-bold text-gray-800">📊 Dashboard</h1>
                <p className="text-gray-500">ภาพรวมของร้านวันนี้</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                            📋
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.todayBookings}</p>
                            <p className="text-xs text-gray-500">จองวันนี้</p>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">
                            📦
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.todayOrders}</p>
                            <p className="text-xs text-gray-500">ออเดอร์วันนี้</p>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-light rounded-xl flex items-center justify-center text-xl">
                            💰
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">฿{stats.todayRevenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">รายได้วันนี้</p>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                            👥
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
                            <p className="text-xs text-gray-500">ลูกค้าทั้งหมด</p>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-light rounded-xl flex items-center justify-center text-xl">
                            🍰
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                            <p className="text-xs text-gray-500">สินค้าทั้งหมด</p>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">
                            🔔
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.unreadNotifications}</p>
                            <p className="text-xs text-gray-500">แจ้งเตือนใหม่</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart (Mini) */}
                <RevenueChart data={revenueData} height={200} />

                {/* Recent Activity */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-kanit font-semibold text-gray-800">🔔 กิจกรรมล่าสุด</h3>
                        <Link href="/admin/notifications" className="text-sm text-pink-dark hover:underline">
                            ดูทั้งหมด →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">ยังไม่มีกิจกรรม</p>
                        ) : (
                            recentActivity.map((noti) => (
                                <div
                                    key={noti.id}
                                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${noti.isRead ? 'bg-gray-50' : 'bg-pink-50 border-l-4 border-pink-primary'
                                        }`}
                                >
                                    <span className="text-xl">{getNotificationIcon(noti.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 line-clamp-2">{noti.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{getTimeAgo(noti.createdAt)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/bookings" className="card p-4 hover:shadow-lg transition-shadow group">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">💇</span>
                        <div>
                            <p className="font-kanit font-semibold text-gray-800 group-hover:text-pink-dark">จัดการจอง</p>
                            <p className="text-sm text-gray-500">ดูและจัดการการจอง</p>
                        </div>
                    </div>
                </Link>
                <Link href="/admin/products" className="card p-4 hover:shadow-lg transition-shadow group">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🍰</span>
                        <div>
                            <p className="font-kanit font-semibold text-gray-800 group-hover:text-pink-dark">จัดการสินค้า</p>
                            <p className="text-sm text-gray-500">เพิ่ม/แก้ไขสินค้า</p>
                        </div>
                    </div>
                </Link>
                <Link href="/admin/orders" className="card p-4 hover:shadow-lg transition-shadow group">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📦</span>
                        <div>
                            <p className="font-kanit font-semibold text-gray-800 group-hover:text-pink-dark">จัดการออเดอร์</p>
                            <p className="text-sm text-gray-500">อัพเดทสถานะออเดอร์</p>
                        </div>
                    </div>
                </Link>
                <Link href="/admin/analytics" className="card p-4 hover:shadow-lg transition-shadow group">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📈</span>
                        <div>
                            <p className="font-kanit font-semibold text-gray-800 group-hover:text-pink-dark">วิเคราะห์</p>
                            <p className="text-sm text-gray-500">ดูกราฟและสถิติ</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
