'use client';

import { useEffect, useState } from 'react';
import { getSettings, updateSettings, ShopSettings } from '@/lib/firestore';

export default function SettingsPage() {
    const [settings, setSettings] = useState<ShopSettings>({
        shopName: '',
        shopAddress: '',
        shopPhone: '',
        shopEmail: '',
        openingHours: '',
        closedDays: '',
        taxRate: 7,
        welcomeMessage: '',
        notifyBooking: true,
        notifyLowStock: true,
        notifyPendingOrder: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await updateSettings(settings);
            showToast('บันทึกเสร็จเลย! ✅');
        } catch (error) {
            showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
            setSaving(false);
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
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="font-kanit text-2xl font-bold text-gray-800">⚙️ ตั้งค่าร้าน</h1>
                <p className="text-gray-500">จัดการข้อมูลร้านและการแจ้งเตือน</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shop Info */}
                <div className="card p-6">
                    <h2 className="font-kanit font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        🏪 ข้อมูลร้าน
                    </h2>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">ชื่อร้าน</label>
                            <input
                                type="text"
                                value={settings.shopName}
                                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                                className="input-field"
                                placeholder="Salon & Sweets"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ที่อยู่</label>
                            <input
                                type="text"
                                value={settings.shopAddress}
                                onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                                className="input-field"
                                placeholder="123 ถนนสุขุมวิท กรุงเทพฯ"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">เบอร์โทร</label>
                                <input
                                    type="tel"
                                    value={settings.shopPhone}
                                    onChange={(e) => setSettings({ ...settings, shopPhone: e.target.value })}
                                    className="input-field"
                                    placeholder="02-123-4567"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">อีเมล</label>
                                <input
                                    type="email"
                                    value={settings.shopEmail}
                                    onChange={(e) => setSettings({ ...settings, shopEmail: e.target.value })}
                                    className="input-field"
                                    placeholder="hello@salonsweets.com"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">เวลาเปิด-ปิด</label>
                                <input
                                    type="text"
                                    value={settings.openingHours}
                                    onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                                    className="input-field"
                                    placeholder="09:00 - 18:00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">วันปิด</label>
                                <input
                                    type="text"
                                    value={settings.closedDays}
                                    onChange={(e) => setSettings({ ...settings, closedDays: e.target.value })}
                                    className="input-field"
                                    placeholder="วันจันทร์"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">ข้อความต้อนรับ (แสดงหน้าแรก)</label>
                            <textarea
                                value={settings.welcomeMessage}
                                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                                className="input-field"
                                rows={3}
                                placeholder="สวัสดีค่ะ! ยินดีต้อนรับสู่ร้านของเรา 💕"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">อัตราภาษี (%)</label>
                            <input
                                type="number"
                                value={settings.taxRate}
                                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                                className="input-field max-w-32"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card p-6">
                    <h2 className="font-kanit font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        🔔 การแจ้งเตือน
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-800">แจ้งเตือนจองใหม่</p>
                                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อมีการจองใหม่</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, notifyBooking: !settings.notifyBooking })}
                                className={`toggle ${settings.notifyBooking ? 'toggle-checked' : 'toggle-unchecked'}`}
                            >
                                <span className={`toggle-dot ${settings.notifyBooking ? 'toggle-dot-checked' : 'toggle-dot-unchecked'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-800">แจ้งเตือนสินค้าหมด</p>
                                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อสินค้าหมดสต็อก</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, notifyLowStock: !settings.notifyLowStock })}
                                className={`toggle ${settings.notifyLowStock ? 'toggle-checked' : 'toggle-unchecked'}`}
                            >
                                <span className={`toggle-dot ${settings.notifyLowStock ? 'toggle-dot-checked' : 'toggle-dot-unchecked'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-800">แจ้งเตือนคำสั่งซื้อรอนาน</p>
                                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อออเดอร์รอเกิน 1 ชั่วโมง</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, notifyPendingOrder: !settings.notifyPendingOrder })}
                                className={`toggle ${settings.notifyPendingOrder ? 'toggle-checked' : 'toggle-unchecked'}`}
                            >
                                <span className={`toggle-dot ${settings.notifyPendingOrder ? 'toggle-dot-checked' : 'toggle-dot-unchecked'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className={`w-full btn-primary flex items-center justify-center gap-2 ${saving ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                >
                    {saving ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            กำลังบันทึก...
                        </>
                    ) : (
                        <>
                            💾 บันทึกการตั้งค่า
                        </>
                    )}
                </button>
            </form>

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
