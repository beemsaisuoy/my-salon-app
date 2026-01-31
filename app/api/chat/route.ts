import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `คุณเป็นผู้ช่วย AI ของร้าน "Salon & Sweets" ร้านทำผมและขายขนมหวาน คุณช่วยตอบคำถามเกี่ยวกับ:
- บริการทำผม (ตัดผม ทำสีผม ดัดผม ยืดผม ทรีทเม้นท์)
- ขนมหวาน (คุกกี้ เค้ก ขนมปัง เครื่องดื่ม)
- การจองบริการ
- ราคาสินค้าและบริการ
- เวลาเปิด-ปิดร้าน

ตอบเป็นภาษาไทย สั้นกระชับ และเป็นมิตร ใช้อิโมจิบ้างเพื่อความน่ารัก`;

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        if (!GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'AI ยังไม่พร้อมใช้งาน กรุณาติดต่อแอดมิน' },
                { status: 500 }
            );
        }

        const { message, history = [] }: { message: string; history: Message[] } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json(
                { error: 'กรุณาพิมพ์ข้อความ' },
                { status: 400 }
            );
        }

        // Build conversation history for Gemini
        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'เข้าใจค่ะ! ยินดีให้บริการค่ะ 💕' }] },
            ...history.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
            { role: 'user', parts: [{ text: message }] },
        ];

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            }),
        });

        if (!response.ok) {
            console.error('Gemini API error:', await response.text());
            return NextResponse.json(
                { error: 'AI ไม่สามารถตอบได้ในขณะนี้' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'ขอโทษค่ะ ไม่สามารถตอบได้ในขณะนี้';

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        );
    }
}
