import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeId } = body;

        if (!employeeId) {
            return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
        }

        // Fetch last 5 check-ins
        const { data: checkins, error } = await supabaseServer
            .from('daily_checkins')
            .select(`
                mood_score,
                created_at,
                analysis_logs (
                    risk_level,
                    sentiment,
                    emotion
                )
            `)
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching digital twin state', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Calculate metrics
        const recentMoods = checkins?.map(c => c.mood_score) || [];
        const avgMood = recentMoods.length > 0
            ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
            : 0;

        const emotionalState = avgMood >= 4 ? 'Positive' : (avgMood >= 2.5 ? 'Neutral' : 'Negative');

        // Simple mock metrics based on mood
        const metrics = {
            physical: Math.round(avgMood * 20), // Mock mapping
            emotional: Math.round(avgMood * 20),
            productivity: Math.round(avgMood * 18) // Slightly lower usually
        };

        return NextResponse.json({
            currentState: emotionalState,
            summary: `User has logged ${checkins?.length} times recently. Average mood is ${avgMood.toFixed(1)}/5.`,
            metrics
        });

    } catch (error) {
        console.error('POST /api/get-digital-twin-state error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
