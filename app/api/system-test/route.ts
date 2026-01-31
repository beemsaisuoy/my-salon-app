
import { NextResponse } from 'next/server';
import { getSiteSettings, searchProductsByEmbedding } from '@/lib/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import generatePayload from 'promptpay-qr';

export async function POST(request: Request) {
    try {
        const { testType } = await request.json();
        const results: any = {};

        // 1. Database Test
        if (testType === 'ALL' || testType === 'DB') {
            try {
                const settings = await getSiteSettings();
                if (settings) {
                    results.db = { status: 'PASS', message: 'Read success' };
                } else {
                    throw new Error('No settings returned');
                }
            } catch (e: any) {
                results.db = { status: 'FAIL', message: e.message };
            }
        }

        // 2. AI Test
        if (testType === 'ALL' || testType === 'AI') {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent('Say "OK" if connected.');
                const response = result.response.text();
                if (response.includes('OK')) {
                    results.ai = { status: 'PASS', message: 'Gemini Responded' };
                } else {
                    results.ai = { status: 'WARNING', message: `Unexpected response: ${response.slice(0, 20)}...` };
                }
            } catch (e: any) {
                results.ai = { status: 'FAIL', message: e.message };
            }
        }

        // 3. Payment QR Test
        if (testType === 'ALL' || testType === 'QR') {
            try {
                const payload = generatePayload('0812345678', { amount: 100 });
                if (payload.startsWith('000201')) {
                    results.qr = { status: 'PASS', message: 'Payload generated' };
                } else {
                    throw new Error('Invalid payload format');
                }
            } catch (e: any) {
                results.qr = { status: 'FAIL', message: e.message };
            }
        }

        // 4. Vector DB Test
        if (testType === 'ALL' || testType === 'VECTOR') {
            try {
                // Dummy vector 768 dim
                const dummyVector = Array(768).fill(0.1);
                await searchProductsByEmbedding(dummyVector);
                results.vector = { status: 'PASS', message: 'Query executed' };
            } catch (e: any) {
                // If extension not installed, it will fail
                results.vector = { status: 'FAIL', message: e.message };
            }
        }

        // 5. Line Notify Test
        if (testType === 'LINE_TEST') {
            try {
                const settings = await getSiteSettings();
                if (!settings.lineToken) {
                    throw new Error('No Line Token configured');
                }

                const response = await fetch('https://notify-api.line.me/api/notify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${settings.lineToken}`,
                    },
                    body: new URLSearchParams({
                        message: `🔔 System Test: การเชื่อมต่อแจ้งเตือนปกติ ✅\nเวลา: ${new Date().toLocaleString('th-TH')}`
                    }),
                });

                if (response.ok) {
                    results.line = { status: 'PASS', message: 'Notification sent' };
                } else {
                    throw new Error(`Line API Error: ${response.status}`);
                }
            } catch (e: any) {
                results.line = { status: 'FAIL', message: e.message };
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
