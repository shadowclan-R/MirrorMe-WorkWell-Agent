import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        // Simple keyword-based mock analysis
        // In production, this would call a real AI service (Gemini/Watsonx)
        const lowerText = (text || '').toLowerCase();
        let sentiment = 'NEUTRAL';
        let score = 0.5;
        let emotion = 'calm';

        if (lowerText.match(/happy|good|great|awesome|love|excellent/)) {
            sentiment = 'POSITIVE';
            score = 0.9;
            emotion = 'joy';
        } else if (lowerText.match(/sad|bad|terrible|hate|stress|tired|angry/)) {
            sentiment = 'NEGATIVE';
            score = 0.2;
            emotion = 'stress';
        }

        return NextResponse.json({
            sentiment,
            score,
            emotion
        });

    } catch (error) {
        console.error('POST /api/analyze-sentiment error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
