'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSettings, ShopSettings } from '@/lib/firestore';

const testimonials = [
    {
        name: 'คุณมินนี่',
        text: 'ทำผมสวยมากค่ะ ช่างเก่งมาก ขนมก็อร่อย!',
        rating: 5,
        avatar: '👩',
    },
    {
        name: 'คุณโน่',
        text: 'บริการดีมาก ราคาสมเหตุสมผล แนะนำเลย',
        rating: 5,
        avatar: '👨',
    },
    {
        name: 'คุณแป้ง',
        text: 'ขนมอร่อยมากค่ะ โดยเฉพาะเค้กเตย หอมมาก!',
        rating: 5,
        avatar: '👧',
    },
];

export default function HomePage() {
    const [settings, setSettings] = useState<ShopSettings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="hero-gradient min-h-[90vh] flex items-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-pink-primary/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-gold-primary/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute top-40 right-1/4 w-20 h-20 bg-pink-primary/30 rounded-full blur-2xl" />

                <div className="container-custom py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div className="animate-slide-up">
                            <span className="inline-block mb-4 px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-pink-dark shadow-sm">
                                💕 ยินดีต้อนรับสู่ร้านของเรา
                            </span>
                            <h1 className="font-kanit text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
                                {settings?.welcomeMessage || (
                                    <>
                                        สวัสดีค่ะ!
                                        <br />
                                        <span className="gradient-text">เปิดให้บริการ</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                                ร้านทำผมและขนมหวานครบวงจร ดูแลความสวยความงามของคุณ
                                พร้อมขนมหวานอร่อยๆ ให้คุณอิ่มใจ
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/booking" className="btn-primary text-center">
                                    💇 จองคิวทำผม
                                </Link>
                                <Link href="/shop" className="btn-secondary text-center">
                                    🍰 ซื้อขนมหวาน
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 mt-12">
                                <div>
                                    <p className="font-kanit text-3xl font-bold text-pink-dark">500+</p>
                                    <p className="text-gray-500 text-sm">ลูกค้าที่ใช้บริการ</p>
                                </div>
                                <div>
                                    <p className="font-kanit text-3xl font-bold text-gold-primary">4.9</p>
                                    <p className="text-gray-500 text-sm">คะแนนรีวิว</p>
                                </div>
                                <div>
                                    <p className="font-kanit text-3xl font-bold text-dark">5+</p>
                                    <p className="text-gray-500 text-sm">ปีประสบการณ์</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image/Cards */}
                        <div className="relative hidden lg:block">
                            <div className="relative">
                                {/* Main card */}
                                <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <img
                                        src="https://picsum.photos/400/300?random=100"
                                        alt="Salon"
                                        className="w-full h-64 object-cover rounded-2xl mb-4"
                                    />
                                    <h3 className="font-kanit font-semibold text-xl text-gray-800">
                                        บริการทำผมครบวงจร
                                    </h3>
                                    <p className="text-gray-500 mt-2">ตัด ย้อม สระ ทรีทเมนต์</p>
                                </div>

                                {/* Floating card */}
                                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4 animate-bounce-soft">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">🎂</span>
                                        <div>
                                            <p className="font-kanit font-semibold">ขนมหวาน</p>
                                            <p className="text-sm text-gray-500">เค้ก คุกกี้ เครื่องดื่ม</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-pink-dark font-medium">✨ เกี่ยวกับเรา</span>
                        <h2 className="font-kanit text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-4">
                            ทำไมต้องเลือกเรา?
                        </h2>
                        <p className="text-gray-600">
                            เรามุ่งมั่นให้บริการที่ดีที่สุด ทั้งการดูแลเส้นผมและขนมหวานอร่อยๆ
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card p-6 text-center">
                            <div className="w-16 h-16 bg-pink-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">💇‍♀️</span>
                            </div>
                            <h3 className="font-kanit font-semibold text-xl text-gray-800 mb-2">
                                ช่างมืออาชีพ
                            </h3>
                            <p className="text-gray-500">
                                ทีมช่างมากประสบการณ์ พร้อมดูแลคุณ
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-6 text-center">
                            <div className="w-16 h-16 bg-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🍰</span>
                            </div>
                            <h3 className="font-kanit font-semibold text-xl text-gray-800 mb-2">
                                ขนมสดใหม่ทุกวัน
                            </h3>
                            <p className="text-gray-500">
                                อบขนมสดใหม่ทุกวัน ใช้วัตถุดิบคุณภาพ
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card p-6 text-center">
                            <div className="w-16 h-16 bg-pink-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">💕</span>
                            </div>
                            <h3 className="font-kanit font-semibold text-xl text-gray-800 mb-2">
                                บริการด้วยใจ
                            </h3>
                            <p className="text-gray-500">
                                ใส่ใจทุกรายละเอียด ลูกค้าต้องพอใจ
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Preview */}
            <section className="py-20 bg-pink-light/50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-pink-dark font-medium">💇 บริการของเรา</span>
                        <h2 className="font-kanit text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                            บริการทำผม
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'ตัดผม', price: 150, icon: '✂️' },
                            { name: 'ย้อมผม', price: 800, icon: '🎨' },
                            { name: 'สระ + ตัด', price: 250, icon: '💆' },
                            { name: 'ซอย + ตัด', price: 300, icon: '✨' },
                            { name: 'ทำผมเกล้าผม', price: 500, icon: '👑' },
                            { name: 'Package Full Glamour', price: 1200, icon: '💎' },
                        ].map((service, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <span className="text-4xl">{service.icon}</span>
                                <h3 className="font-kanit font-semibold text-xl mt-4 text-gray-800">
                                    {service.name}
                                </h3>
                                <p className="text-2xl font-bold text-pink-dark mt-2">
                                    ฿{service.price.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/booking" className="btn-primary inline-block">
                            จองคิวเลย →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-gold-primary font-medium">⭐ รีวิวจากลูกค้า</span>
                        <h2 className="font-kanit text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                            ลูกค้าของเราพูดว่าอะไร
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((review, i) => (
                            <div key={i} className="card p-6">
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(review.rating)].map((_, j) => (
                                        <span key={j} className="text-gold-primary">⭐</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4 italic">
                                    &ldquo;{review.text}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{review.avatar}</span>
                                    <span className="font-medium text-gray-800">{review.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-pink-primary to-pink-dark text-white">
                <div className="container-custom text-center">
                    <h2 className="font-kanit text-3xl md:text-4xl font-bold mb-4">
                        พร้อมให้บริการคุณแล้ว!
                    </h2>
                    <p className="text-white/90 mb-8 max-w-lg mx-auto">
                        จองคิวทำผมหรือสั่งขนมหวานได้เลยวันนี้
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/booking"
                            className="bg-white text-pink-dark font-kanit font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all"
                        >
                            💇 จองคิวทำผม
                        </Link>
                        <Link
                            href="/shop"
                            className="bg-gold-primary text-white font-kanit font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all"
                        >
                            🍰 ดูขนมหวาน
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
