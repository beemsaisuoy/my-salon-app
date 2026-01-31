import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchProductsByEmbedding } from '@/lib/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key not configured' }, { status: 500 });
        }

        // Generate embedding for the query
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;

        // Search in Supabase
        const products = await searchProductsByEmbedding(embedding);

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Semantic Search Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
