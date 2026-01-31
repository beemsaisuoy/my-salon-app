'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/lib/auth';

const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { href: '/admin/analytics', label: 'วิเคราะห์ข้อมูล', icon: '📈' },
    { href: '/admin/bookings', label: 'จัดการจอง', icon: '💇' },
    { href: '/admin/products', label: 'จัดการสินค้า', icon: '🍰' },
    { href: '/admin/orders', label: 'จัดการคำสั่งซื้อ', icon: '📦' },
    { href: '/admin/customers', label: 'ลูกค้า', icon: '👥' },
    { href: '/admin/notifications', label: 'แจ้งเตือน', icon: '🔔' },
    { href: '/admin/settings', label: 'ตั้งค่า', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathname === href;
        }
        return pathname?.startsWith(href) && href !== '/admin';
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:flex flex-col w-64 bg-white shadow-lg fixed h-full z-40">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">💇‍♀️</span>
                            <span className="font-kanit font-bold text-xl gradient-text">
                                Salon & Sweets
                            </span>
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive(item.href, item.exact) ? 'active' : ''}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="mb-3 text-sm text-gray-500 truncate">
                            {user?.email}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="sidebar-link w-full text-red-500 hover:bg-red-50"
                        >
                            <span className="text-lg">🚪</span>
                            <span>ออกจากระบบ</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 lg:ml-64">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-30 bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Page Title */}
                            <h1 className="font-kanit font-semibold text-lg text-gray-800 lg:hidden">
                                Admin
                            </h1>

                            <div className="hidden lg:block" />

                            {/* Right Side */}
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <Link href="/" className="text-sm text-gray-500 hover:text-pink-dark">
                                    ← กลับหน้าเว็บ
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-4 lg:p-6">
                        {children}
                    </main>
                </div>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl animate-slide-in-right">
                            {/* Close Button */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <span className="font-kanit font-bold text-lg gradient-text">Admin</span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Menu */}
                            <nav className="p-4 space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`sidebar-link ${isActive(item.href, item.exact) ? 'active' : ''}`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Logout */}
                            <div className="p-4 border-t border-gray-100 mt-auto">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsSidebarOpen(false);
                                    }}
                                    className="sidebar-link w-full text-red-500 hover:bg-red-50"
                                >
                                    <span className="text-lg">🚪</span>
                                    <span>ออกจากระบบ</span>
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}
