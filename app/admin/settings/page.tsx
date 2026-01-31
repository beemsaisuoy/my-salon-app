'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

// Prevent hydration issues with authentication
export default function AdminSettingsPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    // Form states
    const [promptpayNumber, setPromptpayNumber] = useState('');
    const [promptpayName, setPromptpayName] = useState('');
    const [lineToken, setLineToken] = useState('');
    const [preOrderDays, setPreOrderDays] = useState(3);

    useEffect(() => {
        if (!user) return; // Wait for auth
        if (!isAdmin) {
            router.push('/');
            return;
        }

        async function fetchSettings() {
            setLoading(true);
            try {
                const data = await getSiteSettings();
                setSettings(data);
                setPromptpayNumber(data.promptpayNumber);
                setPromptpayName(data.promptpayName);
                setLineToken(data.lineToken || '');
                setPreOrderDays(data.shopSettings.preOrderDays || 3);
            } catch (error) {
                console.error('Failed to load settings', error);
                alert('โหลดการตั้งค่าไม่สำเร็จ');
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, [user, isAdmin, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSiteSettings({
                promptpayNumber,
                promptpayName,
                lineToken,
                shopSettings: {
                    preOrderDays,
                },
            });
            alert('บันทึกการตั้งค่าเรียบร้อยแล้ว ✅');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('บันทึกไม่สำเร็จ ❌');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">ตั้งค่าระบบ (Admin Settings) ⚙️</h1>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-md space-y-6">

                {/* PromptPay Settings */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-pink-600 border-b pb-2">💳 ตั้งค่าการชำระเงิน (PromptPay)</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์พร้อมเพย์ / เลขบัตรประชาชน</label>
                        <input
                            type="text"
                            value={promptpayNumber}
                            onChange={(e) => setPromptpayNumber(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
                            placeholder="0812345678"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
                        <input
                            type="text"
                            value={promptpayName}
                            onChange={(e) => setPromptpayName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
                            placeholder="ชื่อ นามสกุล"
                            required
                        />
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-green-600 border-b pb-2">🔔 การแจ้งเตือน (Line Notify)</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Line Notify Token (Optional)</label>
                        <input
                            type="text"
                            value={lineToken}
                            onChange={(e) => setLineToken(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300 outline-none"
                            placeholder="วาง Token ที่นี่เพื่อรับแจ้งเตือน"
                        />
                        <p className="text-xs text-gray-500 mt-1">ปล่อยว่างไว้หากไม่ต้องการใช้งาน</p>
                    </div>
                </div>

                {/* Shop Settings */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">🛍️ ตั้งค่าร้านค้า</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ระยะเวลาสั่งล่วงหน้า (สินค้า Pre-order)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                value={preOrderDays}
                                onChange={(e) => setPreOrderDays(Number(e.target.value))}
                                className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none"
                            />
                            <span className="text-gray-600">วัน</span>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-3 rounded-lg text-white font-bold transition-all ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า 💾'}
                    </button>
                    <p className="text-center mt-4">
                        <a href="/admin" className="text-gray-500 hover:text-gray-700 underline">กลับไปหน้า Admin</a>
                    </p>
                </div>

            </form>
        </div>
    );
}
