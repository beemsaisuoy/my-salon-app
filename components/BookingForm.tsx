'use client';

import { useState } from 'react';

interface BookingFormProps {
    onSubmit: (data: {
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        service: string;
        servicePrice: number;
        date: string;
        time: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

const services = [
    { name: 'ตัดผม', price: 150 },
    { name: 'ย้อมผม', price: 800 },
    { name: 'สระ + ตัด', price: 250 },
    { name: 'ซอย + ตัด', price: 300 },
    { name: 'ทำผมเกล้าผม', price: 500 },
    { name: 'Package Full Glamour', price: 1200 },
];

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export default function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        date: '',
        time: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedService = services.find(s => s.name === formData.service);

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'กรุณากรอกชื่อ';
        }
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'กรุณากรอกเบอร์โทร';
        } else if (!/^0\d{8,9}$/.test(formData.customerPhone.replace(/-/g, ''))) {
            newErrors.customerPhone = 'เบอร์โทรไม่ถูกต้อง';
        }
        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'อีเมลไม่ถูกต้อง';
        }
        if (!formData.service) {
            newErrors.service = 'กรุณาเลือกบริการ';
        }
        if (!formData.date) {
            newErrors.date = 'กรุณาเลือกวันที่';
        }
        if (!formData.time) {
            newErrors.time = 'กรุณาเลือกเวลา';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        await onSubmit({
            ...formData,
            servicePrice: selectedService?.price || 0,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label">ชื่อ-นามสกุล *</label>
                    <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className={`input-field ${errors.customerName ? 'border-red-400' : ''}`}
                        placeholder="กรอกชื่อของคุณ"
                    />
                    {errors.customerName && (
                        <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">เบอร์โทร *</label>
                    <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className={`input-field ${errors.customerPhone ? 'border-red-400' : ''}`}
                        placeholder="0xx-xxx-xxxx"
                    />
                    {errors.customerPhone && (
                        <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">อีเมล *</label>
                <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className={`input-field ${errors.customerEmail ? 'border-red-400' : ''}`}
                    placeholder="your@email.com"
                />
                {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                )}
            </div>

            {/* Services */}
            <div className="form-group">
                <label className="form-label">เลือกบริการ *</label>
                <div className="grid sm:grid-cols-2 gap-3">
                    {services.map((service) => (
                        <button
                            key={service.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, service: service.name })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.service === service.name
                                    ? 'border-pink-primary bg-pink-light shadow-lg'
                                    : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50'
                                }`}
                        >
                            <p className="font-kanit font-semibold text-gray-800">{service.name}</p>
                            <p className="text-pink-dark font-bold">฿{service.price.toLocaleString()}</p>
                        </button>
                    ))}
                </div>
                {errors.service && (
                    <p className="text-red-500 text-sm mt-1">{errors.service}</p>
                )}
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label">📅 เลือกวันที่ *</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={getMinDate()}
                        className={`input-field ${errors.date ? 'border-red-400' : ''}`}
                    />
                    {errors.date && (
                        <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">🕐 เลือกเวลา *</label>
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => setFormData({ ...formData, time })}
                                className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.time === time
                                        ? 'border-pink-primary bg-pink-primary text-white'
                                        : 'border-gray-200 hover:border-pink-200 text-gray-700'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                    {errors.time && (
                        <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                    )}
                </div>
            </div>

            {/* Summary */}
            {selectedService && formData.date && formData.time && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-light to-white border border-pink-200">
                    <h4 className="font-kanit font-semibold text-gray-800 mb-2">สรุปการจอง</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                        <p>🎀 บริการ: {selectedService.name}</p>
                        <p>📅 วันที่: {new Date(formData.date).toLocaleDateString('th-TH', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}</p>
                        <p>🕐 เวลา: {formData.time} น.</p>
                        <p className="text-lg font-bold text-pink-dark pt-2">
                            💰 ราคา: ฿{selectedService.price.toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-primary flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
            >
                {isLoading ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        กำลังจอง...
                    </>
                ) : (
                    <>
                        ✨ ยืนยันการจอง
                    </>
                )}
            </button>
        </form>
    );
}
