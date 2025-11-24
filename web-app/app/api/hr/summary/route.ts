import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. High Risk Today
        const { data: todayHighRisk, error: todayErr } = await supabaseServer
            .from('analysis_logs')
            .select('id, risk_level, daily_checkins!inner(created_at)')
            .gte('daily_checkins.created_at', startOfDay)
            .eq('risk_level', 'HIGH');

        if (todayErr) {
            console.error('Error fetching todayHighRisk', todayErr);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 2. Total Checkins Today
        const { data: todayCheckins, error: checkinsErr } = await supabaseServer
            .from('daily_checkins')
            .select('id')
            .gte('created_at', startOfDay);

        if (checkinsErr) {
            console.error('Error fetching todayCheckins', checkinsErr);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 3. Dept Stats (Last 7 Days)
        const { data: deptStats, error: deptErr } = await supabaseServer
            .from('analysis_logs')
            .select('risk_level, daily_checkins!inner(employee_id, created_at, employees!inner(department))')
            .gte('daily_checkins.created_at', sevenDaysAgo);

        if (deptErr) {
            console.error('Error fetching deptStats', deptErr);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Aggregation
        const perDepartment: Record<string, { high: number; medium: number; low: number }> = {};
        const rawRows = deptStats || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawRows.forEach((row: any) => {
            const department = row.daily_checkins?.employees?.department ?? 'Unknown';
            if (!perDepartment[department]) {
                perDepartment[department] = { high: 0, medium: 0, low: 0 };
            }

            if (row.risk_level === 'HIGH') perDepartment[department].high++;
            else if (row.risk_level === 'MEDIUM') perDepartment[department].medium++;
            else perDepartment[department].low++;
        });

        return NextResponse.json({
            employeesAtHighRiskToday: todayHighRisk?.length ?? 0,
            totalCheckinsToday: todayCheckins?.length ?? 0,
            perDepartment,
        });

    } catch (error) {
        console.error('GET /api/hr/summary error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
