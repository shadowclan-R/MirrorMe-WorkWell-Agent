import { useState, useEffect } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseBrowserClient';

const supabase = supabaseBrowserClient;

export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DailyCheckin {
    id: string;
    employee_id: string;
    mood_score: MoodScore;
    note_text: string | null;
    channel: string | null;
    created_at: string;
}

export interface AnalysisLog {
    id: string;
    checkin_id: string;
    sentiment: string | null;
    sentiment_score: number | null;
    emotion: string | null;
    risk_level: RiskLevel | null;
    recommendation: string | null;
    burnout_score: number | null;
    model_source: string | null;
    created_at: string;
}

export interface TwinMetrics {
    physical: number;
    emotional: number;
    productivity: number;
}

export interface DigitalTwinState {
    id: string;
    employee_id: string;
    current_state: string;
    summary_text: string | null;
    metrics: TwinMetrics | null;
    last_updated: string;
}

export interface ActivityLog {
    id: string;
    employee_id: string;
    activity_type: string;
    description: string | null;
    duration_minutes: number | null;
    timestamp: string;
}

export interface StressProfileEntry {
    period: string;
    level: string;
    percentage: number;
}

export interface CommunicationStat {
    messages: number;
    engagement: string;
}

export type CommunicationStats = Record<string, CommunicationStat>;

export interface BalanceMetric {
    value: string;
    percentage: number;
}

export interface WorkLifeBalance {
    work_hours?: BalanceMetric;
    personal_time?: BalanceMetric;
    sleep_quality?: BalanceMetric;
}

export interface TeamInteractionStats {
    meetings?: number;
    collaboration_score?: string;
    response_time?: string;
}

export interface RiskItemEntry {
    label: string;
    level: string;
    color: string;
}

export interface RecommendationEntry {
    title: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
}

export interface TimelineEvent {
    date: string;
    event: string;
    type: 'success' | 'milestone' | 'warning' | 'info';
}

export interface DigitalTwinReport {
    id: string;
    employee_id: string;
    health_score: number | null;
    risk_level: string | null;
    energy_level: string | null;
    focus_score: number | null;
    task_completion: number | null;
    stress_profile: StressProfileEntry[] | null;
    communication_stats: CommunicationStats | null;
    work_life_balance: WorkLifeBalance | null;
    team_interactions: TeamInteractionStats | null;
    risk_items: RiskItemEntry[] | null;
    recommendations: RecommendationEntry[] | null;
    timeline: TimelineEvent[] | null;
    created_at: string;
}

export interface EmployeeData {
    id: string;
    full_name: string;
    job_title: string;
    department: string;
    avatar_url: string | null;
    checkins: DailyCheckin[];
    twinState: DigitalTwinState | null;
    twinReport: DigitalTwinReport | null;
    insights: AnalysisLog[];
    activityLogs: ActivityLog[];
}

export interface SystemAlert {
    id: string;
    alert_level: string;
    message: string;
    created_at: string;
}

export interface EmployeeSummary {
    id: string;
    full_name: string;
    department: string;
    job_title: string;
    status: string;
    daily_checkins: { created_at: string; mood_score: MoodScore | null }[];
}

export interface HRData {
    totalEmployees: number;
    activeToday: number;
    highRiskCount: number;
    avgWellbeing: number;
    employees: EmployeeSummary[];
    alerts: SystemAlert[];
}

type EmployeeRow = {
    id: string;
    full_name: string;
    email: string;
    department: string;
    job_title: string;
    avatar_url: string | null;
};

export function useEmployeeData(email: string | null, refreshSignal = 0) {
    const [data, setData] = useState<EmployeeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!email) {
            setData(null);
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);

                const { data: emp, error: empError } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (empError) throw empError;
                if (!emp) throw new Error('Employee not found');
                const employee = emp as EmployeeRow;

                const { data: checkinsRaw, error: checkinsError } = await supabase
                    .from('daily_checkins')
                    .select('*')
                    .eq('employee_id', employee.id)
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (checkinsError) throw checkinsError;

                const checkins = (checkinsRaw as DailyCheckin[] | null) ?? [];

                const { data: twinStateRaw } = await supabase
                    .from('digital_twin_states')
                    .select('*')
                    .eq('employee_id', employee.id)
                    .maybeSingle();

                const twinState = (twinStateRaw as DigitalTwinState | null) ?? null;

                const { data: twinReportRaw } = await supabase
                    .from('digital_twin_reports')
                    .select('*')
                    .eq('employee_id', employee.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                const twinReport = (twinReportRaw as DigitalTwinReport | null) ?? null;

                let insights: AnalysisLog[] = [];
                if (checkins && checkins.length > 0) {
                    const checkinIds = checkins.map((c) => c.id);
                    const { data: logs } = await supabase
                        .from('analysis_logs')
                        .select('*')
                        .in('checkin_id', checkinIds)
                        .order('created_at', { ascending: false });
                    insights = (logs as AnalysisLog[] | null) ?? [];
                }

                const { data: activitiesRaw, error: activityError } = await supabase
                    .from('activity_logs')
                    .select('*')
                    .eq('employee_id', employee.id)
                    .order('timestamp', { ascending: false })
                    .limit(50);

                if (activityError) throw activityError;
                const activityLogs = (activitiesRaw as ActivityLog[] | null) ?? [];

                if (!isMounted) {
                    return;
                }

                setData({
                    id: employee.id,
                    full_name: employee.full_name,
                    job_title: employee.job_title,
                    department: employee.department,
                    avatar_url: employee.avatar_url,
                    checkins,
                    twinState,
                    twinReport,
                    insights,
                    activityLogs,
                });
            } catch (err) {
                console.error('Error fetching employee data:', err);
                const message = err instanceof Error ? err.message : 'Unexpected error fetching employee data';
                setError(message);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [email, refreshSignal]);

    return { data, loading, error };
}

export function useHRData() {
    const [data, setData] = useState<HRData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);

                const { data: employeesRaw, error: empError } = await supabase
                    .from('employees')
                    .select('id, full_name, department, job_title, status, daily_checkins(created_at, mood_score)');

                if (empError) throw empError;
                const employees = (employeesRaw as EmployeeSummary[] | null) ?? [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: activeCount } = await supabase
                    .from('daily_checkins')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today.toISOString());

                const { data: highRiskLogsRaw } = await supabase
                    .from('analysis_logs')
                    .select('risk_level')
                    .eq('risk_level', 'HIGH');

                const highRiskLogs = highRiskLogsRaw as { risk_level: RiskLevel }[] | null;

                const { data: recentCheckinsRaw } = await supabase
                    .from('daily_checkins')
                    .select('mood_score')
                    .limit(100);

                const recentCheckins = recentCheckinsRaw as Pick<DailyCheckin, 'mood_score'>[] | null;

                let avgScore = 0;
                if (recentCheckins && recentCheckins.length > 0) {
                    const sum = recentCheckins.reduce((acc, curr) => acc + (curr.mood_score ?? 0), 0);
                    avgScore = Math.round((sum / recentCheckins.length) * 20);
                }

                if (!isMounted) {
                    return;
                }

                setData({
                    totalEmployees: employees.length,
                    activeToday: activeCount ?? 0,
                    highRiskCount: highRiskLogs?.length ?? 0,
                    avgWellbeing: avgScore,
                    employees,
                    alerts: [],
                });
            } catch (err) {
                console.error('Error fetching HR data:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { data, loading };
}

export interface HRManagerProfile {
    id: string;
    full_name: string;
    email: string;
    role_title: string;
    permissions: string[];
}

export function useHRProfile() {
    const [profile, setProfile] = useState<HRManagerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                setLoading(true);
                // In a real app, we would fetch the logged-in user's profile.
                // For this demo, we'll fetch the first HR manager or a specific one.
                // Since we don't have auth context here, we'll fetch the one created in the seed.

                const { data, error } = await supabase
                    .from('hr_managers')
                    .select('*')
                    .limit(1)
                    .single();

                if (error) throw error;

                if (isMounted && data) {
                    setProfile({
                        id: data.id,
                        full_name: data.full_name,
                        email: data.email,
                        role_title: data.role_title || 'HR Manager',
                        permissions: Array.isArray(data.permissions) ? data.permissions : [],
                    });
                }
            } catch (err) {
                console.error('Error fetching HR profile:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    return { profile, loading };
}
