import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { name, category, keywords } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key not configured' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are a creative copywriter for a trendy Salon & Dessert Cafe in Thailand.
        Write a short, catchy, and appetizing product description (in Thai) for a new item.
        
        Product Name: ${name}
        Category: ${category}
        Keywords/Context: ${keywords || '-'}
        
        Requirements:
        1. Tone: Friendly, delicious, inviting, slightly fun (use emojis).
        2. Length: 2-3 sentences.
        3. Also generate 3-5 relevant tags (hashtags).
        
        Output JSON format:
        {
          "description": "...",
          "tags": ["tag1", "tag2", "tag3"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error('AI Gen Error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
