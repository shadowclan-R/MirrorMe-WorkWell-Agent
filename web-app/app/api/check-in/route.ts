import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeId, moodScore, notes, sentimentResult, channel = 'API' } = body;

        if (!employeeId || !moodScore) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Logic to determine risk level
        let riskLevel = 'LOW';
        let recommendation = 'Keep up the good work! Remember to take breaks.';

        if (moodScore <= 2 || (sentimentResult && sentimentResult.sentiment === 'NEGATIVE')) {
            riskLevel = 'HIGH';
            recommendation = 'It seems like you are having a tough time. We recommend taking a short break or speaking with a mentor.';
        } else if (moodScore === 3) {
            riskLevel = 'MEDIUM';
            recommendation = 'You are doing okay. Maybe try a quick meditation session?';
        }

        // 1) Insert into daily_checkins
        const { data: checkin, error: checkinError } = await supabaseServer
            .from('daily_checkins')
            .insert([
                {
                    employee_id: employeeId,
                    mood_score: moodScore,
                    note_text: notes ?? null,
                    channel,
                },
            ])
            .select()
            .single();

        if (checkinError || !checkin) {
            console.error('Error inserting checkin', checkinError);
            return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
        }

        // 2) Insert into analysis_logs
        const sentiment = sentimentResult?.sentiment ?? null;
        const sentimentScore = sentimentResult?.score ?? null;
        const emotion = sentimentResult?.emotion ?? null;

        const { error: analysisError } = await supabaseServer
            .from('analysis_logs')
            .insert([
                {
                    checkin_id: checkin.id,
                    sentiment,
                    sentiment_score: sentimentScore,
                    emotion,
                    burnout_score: null,
                    risk_level: riskLevel,
                    recommendation,
                    model_source: 'mirror-me-api',
                },
            ]);

        if (analysisError) {
            console.error('Error inserting analysis', analysisError);
            // We don't fail the request if analysis log fails, but we log it
        }

        return NextResponse.json({
            status: 'success',
            riskLevel,
            recommendation,
        });

    } catch (error) {
        console.error('POST /api/check-in error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
