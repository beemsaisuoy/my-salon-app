import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/firestore';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SERVICES = [
    { name: 'ตัดผม (Haircut)', price: '350+' },
    { name: 'ทำสีผม (Hair Color)', price: '1,500+' },
    { name: 'ดัดผม (Perm)', price: '2,000+' },
    { name: 'ยืดผม (Straightening)', price: '1,200+' },
    { name: 'ทรีทเม้นท์ (Treatment)', price: '500+' },
    { name: 'ทำเล็บ (Manicure/Pedicure)', price: '300+' },
    { name: 'สปา (Spa)', price: '1,000+' },
];

export async function POST(request: NextRequest) {
    try {
        if (!GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'AI ยังไม่พร้อมใช้งาน กรุณาติดต่อแอดมิน' },
                { status: 500 }
            );
        }

        const { message, history = [] }: { message: string; history: any[] } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json(
                { error: 'กรุณาพิมพ์ข้อความ' },
                { status: 400 }
            );
        }

        // Fetch real data to make AI smart
        const products = await getProducts();

        const productsList = products.map(p =>
            `- ${p.name} (${p.category}) ราคา ฿${p.price} ${p.stock > 0 ? `✅ มีของ (${p.stock})` : '❌ หมด'} ${p.stock === 0 && p.preOrderDays ? `(สั่งล่วงหน้า ${p.preOrderDays} วัน)` : ''}`
        ).join('\n');

        const servicesList = SERVICES.map(s =>
            `- ${s.name} เริ่มต้น ฿${s.price}`
        ).join('\n');

        const SYSTEM_PROMPT = `คุณเป็นผู้ช่วย AI ของร้าน "Salon & Sweets" ร้านทำผมและขายขนมหวาน
หน้าที่ของคุณคือให้ข้อมูลลูกค้าอย่างถูกต้อง น่ารัก และเป็นกันเอง (ตลกนิดๆ ได้)

ข้อมูลร้าน:
- เวลาเปิด-ปิด: 09:00 - 18:00 (หยุดวันจันทร์)
- โทร: 02-123-4567

รายการบริการทำผม:
${servicesList}

รายการขนมและเครื่องดื่ม (อัพเดทล่าสุด):
${productsList}

คำแนะนำ:
- ถ้าลูกค้าถามเรื่องทำผม ให้แนะนำบริการและบอกว่าต้องจองคิว
- ถ้าลูกค้าถามเรื่องขนม เชียร์ขายตัวที่มีของ (In Stock)
- ถ้าสินค้าตัวไหนหมด ให้บอกตรงๆ และแนะนำตัวอื่นที่ใกล้เคียง
- ตอบสั้นๆ กระชับ ได้ใจความ
- ใช้อิโมจิเยอะๆ เพื่อความสดใส 💖✨💇‍♀️🍰`;

        // Build conversation history for Gemini
        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'รับทราบค่ะ! พร้อมบริการด้วยความสดใสและข้อมูลที่ครบถ้วนค่ะ 💕✨' }] },
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
