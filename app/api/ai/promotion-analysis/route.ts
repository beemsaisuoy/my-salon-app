import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOrders } from '@/lib/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        // fetch user order history
        // This is a simplified example. In reality, you'd fetch from Supabase
        // with filters for the specific user and time range.

        // For demonstration, we'll mock the data or just use a generic prompt
        // if no heavy backend logic is ready for per-user analytics.

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key not configured' }, { status: 500 });
        }

        const prompt = `
        Analyze the customer's behavior (User ID: ${userId}) and suggest a personalized promotion message for LINE OA.
        Customer hasn't visited in 2 months. Use a friendly Thai tone. 
        Offer: "Buy 1 Get 1 Free on all Coffees" or "10% Off Hair Spa".
        Keep it short (max 100 chars).
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ promotionMessage: text });

    } catch (error) {
        console.error('Promotion Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
