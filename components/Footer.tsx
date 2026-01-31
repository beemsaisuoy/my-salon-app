'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on admin routes
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-dark text-white mt-auto">
            <div className="container-custom py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">💇‍♀️</span>
                            <span className="font-kanit font-bold text-xl text-pink-primary">
                                Salon & Sweets
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            ร้านทำผมและขนมหวานของเรา พร้อมบริการด้วยใจครับ/ค่ะ
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-kanit font-semibold text-lg mb-4">ลิงก์ด่วน</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-pink-primary transition-colors">
                                    หน้าแรก
                                </Link>
                            </li>
                            <li>
                                <Link href="/booking" className="text-gray-400 hover:text-pink-primary transition-colors">
                                    จองคิวทำผม
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop" className="text-gray-400 hover:text-pink-primary transition-colors">
                                    ขนมหวาน
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-kanit font-semibold text-lg mb-4">ติดต่อเรา</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li className="flex items-center gap-2">
                                <span>📍</span>
                                <span>123 ถนนสุขุมวิท กรุงเทพฯ</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span>
                                <span>02-123-4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✉️</span>
                                <span>hello@salonsweets.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🕒</span>
                                <span>09:00 - 18:00 (ปิดวันจันทร์)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-kanit font-semibold text-lg mb-4">ติดตามเรา</h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-primary transition-colors">
                                <span className="text-lg">📘</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-primary transition-colors">
                                <span className="text-lg">📸</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-primary transition-colors">
                                <span className="text-lg">🎵</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-primary transition-colors">
                                <span className="text-lg">💬</span>
                            </a>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-700 my-8" />

                <div className="text-center text-gray-500 text-sm">
                    <p>© 2024 Salon & Sweets. All rights reserved.</p>
                    <p className="mt-1">Made with 💕 in Thailand</p>
                </div>
            </div>
        </footer>
    );
}
