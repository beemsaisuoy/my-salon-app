import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';

interface PromptPayQRProps {
    phoneNumber: string;
    amount: number;
    className?: string;
}

export default function PromptPayQR({ phoneNumber, amount, className = '' }: PromptPayQRProps) {
    // Ensure phone number is valid for promptpay-qr (remove non-digits, etc)
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    // Generate payload
    let payload = '';
    try {
        if (cleanPhone && amount > 0) {
            payload = generatePayload(cleanPhone, { amount });
        }
    } catch (e) {
        console.error("Error generating PromptPay payload", e);
    }

    if (!payload) {
        return <div className="text-red-500 text-sm">ไม่สามารถสร้าง QR Code ได้ (เบอร์โทรหรือยอดเงินไม่ถูกต้อง)</div>;
    }

    return (
        <div className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border ${className}`}>
            <QRCodeCanvas value={payload} size={200} level="M" />
            <p className="mt-2 text-sm text-gray-500 font-medium">สแกนเพื่อจ่ายเงิน: ฿{amount.toLocaleString()}</p>
        </div>
    );
}
