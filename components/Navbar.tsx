'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useCart } from './CartProvider';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Hide navbar on admin routes
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">💇‍♀️</span>
                        <span className="font-kanit font-bold text-xl gradient-text">
                            Salon & Sweets
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`font-medium transition-colors ${pathname === '/' ? 'text-pink-dark' : 'text-gray-600 hover:text-pink-dark'}`}
                        >
                            หน้าแรก
                        </Link>
                        <Link
                            href="/booking"
                            className={`font-medium transition-colors ${pathname === '/booking' ? 'text-pink-dark' : 'text-gray-600 hover:text-pink-dark'}`}
                        >
                            จองคิวทำผม
                        </Link>
                        <Link
                            href="/shop"
                            className={`font-medium transition-colors ${pathname === '/shop' ? 'text-pink-dark' : 'text-gray-600 hover:text-pink-dark'}`}
                        >
                            ขนมหวาน
                        </Link>

                        {/* Cart */}
                        <Link href="/shop/cart" className="relative p-2 hover:bg-pink-light rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 hidden lg:block">
                                    {user.displayName || user.email?.split('@')[0]}
                                </span>
                                {isAdmin && (
                                    <Link href="/admin" className="btn-secondary text-sm py-2 px-4">
                                        Admin
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="btn-ghost text-sm">
                                    ออกจากระบบ
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="btn-primary text-sm py-2 px-4">
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-pink-light rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-pink-100 animate-fade-in">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-2 rounded-lg hover:bg-pink-light transition-colors"
                            >
                                หน้าแรก
                            </Link>
                            <Link
                                href="/booking"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-2 rounded-lg hover:bg-pink-light transition-colors"
                            >
                                จองคิวทำผม
                            </Link>
                            <Link
                                href="/shop"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-2 rounded-lg hover:bg-pink-light transition-colors"
                            >
                                ขนมหวาน
                            </Link>
                            <Link
                                href="/shop/cart"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-2 rounded-lg hover:bg-pink-light transition-colors flex items-center gap-2"
                            >
                                ตะกร้า
                                {itemCount > 0 && (
                                    <span className="bg-pink-primary text-white text-xs px-2 py-0.5 rounded-full">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                            <hr className="border-pink-100 my-2" />
                            {user ? (
                                <>
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                        {user.email}
                                    </div>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-2 rounded-lg bg-gold-light text-gold-dark font-medium"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="px-4 py-2 text-left rounded-lg hover:bg-red-50 text-red-600"
                                    >
                                        ออกจากระบบ
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mx-4 btn-primary text-center"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
