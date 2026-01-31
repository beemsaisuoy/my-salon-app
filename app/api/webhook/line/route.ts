
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSiteSettings, getProducts } from '@/lib/firestore';

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-line-signature');
        const settings = await getSiteSettings();

        // 1. Verify Signature
        if (!settings.lineChannelSecret || !settings.lineChannelAccessToken) {
            console.error('Line credentials missing');
            return NextResponse.json({ error: 'Settings missing' }, { status: 500 });
        }

        const hash = crypto
            .createHmac('sha256', settings.lineChannelSecret)
            .update(body)
            .digest('base64');

        if (hash !== signature) {
            console.error('Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const events = JSON.parse(body).events;

        // 2. Process Events
        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                await handleTextMessage(event, settings.lineChannelAccessToken);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

async function handleTextMessage(event: any, accessToken: string) {
    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    // 1. Get Context (Products)
    const products = await getProducts();
    const productList = products.map(p =>
        `- ${p.name} (${p.price}บ.) Status: ${p.stock > 0 ? 'มีของ' : (p.preOrderDays > 0 ? `สั่งทำ ${p.preOrderDays} วัน` : 'หมด')}`
    ).join('\n');

    // 2. Generate AI Reply
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
    You are "Salon AI", a helpful assistant for "Salon & Dessert Cafe".
    User Message: "${userMessage}"
    
    Current Menu & Stock:
    ${productList}
    
    Instructions:
    - Answer in Thai, polite and friendly (add emojis).
    - If asking about stock, check the list.
    - If ordering, tell them to visit the website.
    - Keep it short (max 2-3 sentences).
    - If unknown, recommend visiting the shop page.
    `;

    try {
        const result = await model.generateContent(prompt);
        const replyText = result.response.text();

        // 3. Reply to Line
        await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                replyToken: replyToken,
                messages: [{ type: 'text', text: replyText }],
            }),
        });
    } catch (e) {
        console.error('AI/Line Reply Error:', e);
    }
}
