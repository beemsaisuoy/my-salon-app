'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/lib/auth';
import { addOrder, deductStock, getSiteSettings } from '@/lib/firestore';
import { createNotification, sendLineNotify } from '@/lib/notifications';
import PromptPayQR from '@/components/PromptPayQR';

export default function CartPage() {
    const router = useRouter();
    const { items, removeFromCart, updateQuantity, clearCart, subtotal, tax, total, itemCount } = useCart();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'store' | 'promptpay'>('store');
    const [settings, setSettings] = useState<any>(null);

    // Load settings for PromptPay (correctly using useEffect)
    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleCheckout = async () => {
        if (!user) {
            router.push('/login?redirect=/shop/cart');
            return;
        }

        setIsLoading(true);
        try {
            // Deduct Stock first
            await deductStock(items.map(i => ({ productId: i.productId, quantity: i.quantity })));

            const orderId = await addOrder({
                userId: user.id,
                userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'ลูกค้า',
                userEmail: user.email || '',
                items: items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                })),
                subtotal,
                tax,
                total,
                status: 'รอเตรียม',
                paymentMethod: paymentMethod === 'promptpay' ? 'โอนเงิน (PromptPay)' : 'จ่ายที่ร้าน',
            });

            // Create notification
            await createNotification(
                'order_new',
                `คำสั่งซื้อใหม่จาก ${user.user_metadata?.full_name || user.email?.split('@')[0]} — รวม ฿${total.toLocaleString()}`,
                orderId
            );

            // Send Line Notify
            await sendLineNotify(`🛍️ มีคำสั่งซื้อใหม่! (฿${total.toLocaleString()})\nจาก: ${user.user_metadata?.full_name || user.email}\nดูรายละเอียดที่ Admin Dashboard`);


            clearCart();
            setIsSuccess(true);
            showToast('สั่งเสร็จเลย! 🎉');
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="card p-8 text-center max-w-md mx-4 animate-fade-in">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-6xl">🎉</span>
                    </div>
                    <h2 className="font-kanit text-2xl font-bold text-gray-800 mb-2">
                        สั่งซื้อเสร็จเรียบร้อย!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        ขอบคุณที่อุดหนุนค่ะ มารับขนมได้เลยที่ร้าน
                    </p>
                    {paymentMethod === 'promptpay' && (
                        <div className="bg-pink-50 p-4 rounded-xl mb-6">
                            <p className="font-semibold text-pink-600 mb-2">กรุณาชำระเงิน</p>
                            {settings && (
                                <PromptPayQR
                                    phoneNumber={settings.promptpayNumber || '0812345678'}
                                    amount={total}
                                    className="bg-white shadow-sm"
                                />
                            )}
                            <p className="text-sm text-gray-500 mt-2">แจ้งสลิปการโอนที่เคาน์เตอร์ได้เลยค่ะ</p>
                        </div>
                    )}
                    <p className="text-pink-dark font-medium mb-6">
                        💰 ยอดรวม: ฿{total.toLocaleString()}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/shop" className="btn-primary">
                            ซื้อเพิ่ม
                        </Link>
                        <Link href="/" className="btn-outline">
                            กลับหน้าแรก
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen bg-gray-50">
            <div className="container-custom py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/shop" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="font-kanit text-2xl font-bold text-gray-800">
                            🛒 ตะกร้าสินค้า
                        </h1>
                    </div>

                    {items.length === 0 ? (
                        /* Empty Cart */
                        <div className="card p-12 text-center">
                            <span className="text-6xl">🛒</span>
                            <h2 className="font-kanit text-xl font-semibold text-gray-800 mt-4 mb-2">
                                ตะกร้าว่างเปล่า
                            </h2>
                            <p className="text-gray-500 mb-6">
                                ยังไม่มีสินค้าในตะกร้า ไปเลือกขนมกันเถอะ!
                            </p>
                            <Link href="/shop" className="btn-primary">
                                ไปดูขนม →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div key={item.productId} className="card p-4 flex gap-4">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-24 h-24 object-cover rounded-xl"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-kanit font-semibold text-gray-800">
                                                {item.productName}
                                            </h3>
                                            <p className="text-pink-dark font-bold">
                                                ฿{item.price.toLocaleString()}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mt-3">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="font-medium w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <p className="font-bold text-gray-800">
                                                ฿{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="card p-6 sticky top-20">
                                    <h2 className="font-kanit font-semibold text-lg text-gray-800 mb-4">
                                        สรุปคำสั่งซื้อ
                                    </h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>รายการ ({itemCount})</span>
                                            <span>฿{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>ภาษี (7%)</span>
                                            <span>฿{tax.toLocaleString()}</span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>รวมทั้งหมด</span>
                                            <span className="text-pink-dark">฿{total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <p className="text-sm font-semibold text-gray-700 mb-3">วิธีชำระเงิน</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-all">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="store"
                                                    checked={paymentMethod === 'store'}
                                                    onChange={() => setPaymentMethod('store')}
                                                    className="text-pink-500 focus:ring-pink-500"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span>💵</span>
                                                    <span>จ่ายที่ร้าน (เงินสด)</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-all">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="promptpay"
                                                    checked={paymentMethod === 'promptpay'}
                                                    onChange={() => setPaymentMethod('promptpay')}
                                                    className="text-pink-500 focus:ring-pink-500"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span>📲</span>
                                                    <span>โอนเงิน (PromptPay)</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {!user && (
                                        <p className="text-sm text-gray-500 mb-4 text-center">
                                            กรุณาเข้าสู่ระบบก่อนสั่งซื้อ
                                        </p>
                                    )}

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isLoading}
                                        className={`w-full btn-primary flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                กำลังสั่ง...
                                            </>
                                        ) : (
                                            <>
                                                {user ? '✅ ยืนยันสั่งซื้อ' : '🔐 เข้าสู่ระบบเพื่อสั่ง'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{toast.type === 'success' ? '✅' : '❌'}</span>
                        <p className="font-medium text-gray-800">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
