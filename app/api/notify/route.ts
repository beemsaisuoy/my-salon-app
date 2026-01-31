
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { message, token } = await request.json();

        if (!message || !token) {
            return NextResponse.json({ error: 'Message and token are required' }, { status: 400 });
        }

        const formData = new URLSearchParams();
        formData.append('message', message);

        const res = await fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Line Notify Error:', errorText);
            return NextResponse.json({ error: 'Failed to send notification' }, { status: res.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notify API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
