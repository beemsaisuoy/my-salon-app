'use client';

import { useState } from 'react';
import BookingForm from '@/components/BookingForm';
import { addBooking } from '@/lib/firestore';
import { createNotification } from '@/lib/notifications';

export default function BookingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (data: {
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        service: string;
        servicePrice: number;
        date: string;
        time: string;
    }) => {
        setIsLoading(true);
        try {
            // Save booking
            const bookingId = await addBooking({
                ...data,
                status: 'รอยืนยัน',
            });

            // Create notification
            await createNotification(
                'booking_new',
                `จองใหม่จาก ${data.customerName} — บริการ ${data.service} วันที่ ${data.date}`,
                bookingId
            );

            setIsSuccess(true);
            showToast('จองเสร็จเลยนะ! 😊');
        } catch (error) {
            console.error('Booking error:', error);
            showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewBooking = () => {
        setIsSuccess(false);
    };

    return (
        <div className="pt-16 min-h-screen bg-gradient-to-br from-pink-light via-white to-gold-light/30">
            <div className="container-custom py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <span className="inline-block mb-2 text-4xl">💇‍♀️</span>
                        <h1 className="font-kanit text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                            จองคิวทำผม
                        </h1>
                        <p className="text-gray-600">
                            เลือกบริการและเวลาที่สะดวก เราพร้อมดูแลคุณ
                        </p>
                    </div>

                    {isSuccess ? (
                        /* Success State */
                        <div className="card p-8 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-5xl">✅</span>
                            </div>
                            <h2 className="font-kanit text-2xl font-bold text-gray-800 mb-2">
                                จองเสร็จเรียบร้อย!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                ขอบคุณที่ใช้บริการค่ะ เราจะติดต่อกลับเพื่อยืนยันนัด
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={handleNewBooking} className="btn-primary">
                                    จองเพิ่มอีก
                                </button>
                                <a href="/" className="btn-outline">
                                    กลับหน้าแรก
                                </a>
                            </div>
                        </div>
                    ) : (
                        /* Booking Form */
                        <div className="card p-6 md:p-8">
                            <BookingForm onSubmit={handleSubmit} isLoading={isLoading} />
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-8 grid sm:grid-cols-3 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                            <span className="text-2xl">🕒</span>
                            <p className="font-kanit font-medium mt-2">เปิดทุกวัน</p>
                            <p className="text-sm text-gray-500">09:00 - 18:00</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                            <span className="text-2xl">📍</span>
                            <p className="font-kanit font-medium mt-2">ที่อยู่ร้าน</p>
                            <p className="text-sm text-gray-500">123 ถ.สุขุมวิท กทม.</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                            <span className="text-2xl">📞</span>
                            <p className="font-kanit font-medium mt-2">โทรจอง</p>
                            <p className="text-sm text-gray-500">02-123-4567</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">
                            {toast.type === 'success' ? '✅' : '❌'}
                        </span>
                        <p className="font-medium text-gray-800">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
