'use client';

import React from 'react';
import {
    LayoutDashboard,
    Calendar,
    ShoppingBag,
    LogOut,
    Sparkles,
    Cake
} from 'lucide-react';

interface AdminSidebarProps {
    activeTab: 'dashboard' | 'bookings' | 'orders';
    setActiveTab: (tab: 'dashboard' | 'bookings' | 'orders') => void;
    onLogout: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
    const menuItems = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bookings' as const, label: 'Bookings', icon: Calendar },
        { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    ];

    return (
        <aside className="w-64 bg-gradient-to-b from-brown-900 to-brown-800 text-white min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-brown-700">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cream-50 flex items-center justify-center">
                            <Cake className="w-2.5 h-2.5 text-brown-700" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-lg">Salon & Sweet</h2>
                        <p className="text-xs text-brown-400">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                            : 'text-brown-300 hover:bg-brown-700 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-brown-700">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-brown-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
