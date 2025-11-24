import { supabaseBrowserClient } from './supabaseBrowserClient';
import { analyzeSentimentWithGemini, sendMessageToGemini } from './gemini-service';
import { sendMessageToIBM } from './ibm-service';

// --- Types ---
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CheckInResult {
    status: 'success' | 'error';
    riskLevel?: RiskLevel;
    recommendation?: string;
    error?: string;
}

export interface HRSummary {
    employeesAtHighRiskToday: number;
    totalCheckinsToday: number;
    perDepartment: Record<string, { high: number; medium: number; low: number }>;
}

// --- Services ---

/**
 * Analyzes sentiment using Gemini (Client-side)
 */
export async function analyzeSentimentService(text: string) {
    return await analyzeSentimentWithGemini(text);
}

/**
 * Submits a check-in and logs analysis (Client-side replacement for /api/check-in)
 */
export async function submitCheckInService(
    employeeId: string,
    moodScore: number,
    sentimentResult: { sentiment: string; score: number; emotion: string } | null,
    notes: string,
    channel: string = 'WEB'
): Promise<CheckInResult> {
    try {
        // Logic to determine risk level (mirrors server logic)
        let riskLevel: RiskLevel = 'LOW';
        let recommendation = 'Keep up the good work! Remember to take breaks.';

        if (moodScore <= 2 || (sentimentResult && sentimentResult.sentiment === 'NEGATIVE')) {
            riskLevel = 'HIGH';
            recommendation = 'It seems like you are having a tough time. We recommend taking a short break or speaking with a mentor.';
        } else if (moodScore === 3) {
            riskLevel = 'MEDIUM';
            recommendation = 'You are doing okay. Maybe try a quick meditation session?';
        }

        // 1) Insert into daily_checkins
        const { data: checkin, error: checkinError } = await supabaseBrowserClient
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
            return { status: 'error', error: 'Failed to save check-in' };
        }

        // 2) Insert into analysis_logs
        const sentiment = sentimentResult?.sentiment ?? null;
        const sentimentScore = sentimentResult?.score ?? null;
        const emotion = sentimentResult?.emotion ?? null;

        const { error: analysisError } = await supabaseBrowserClient
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
                    model_source: 'mirror-me-client',
                },
            ]);

        if (analysisError) {
            console.error('Error inserting analysis', analysisError);
        }

        // 3) Insert into chat_logs
        const userContent = (notes && notes.trim().length > 0)
            ? notes.trim()
            : `Mood score ${moodScore}/5 via ${channel} check-in.`;

        const assistantContent = recommendation || 'Recommendation pending review.';

        await supabaseBrowserClient
            .from('chat_logs')
            .insert([
                {
                    employee_id: employeeId,
                    role: 'user',
                    content: userContent,
                    media_type: 'text',
                    timestamp: new Date().toISOString(),
                },
                {
                    employee_id: employeeId,
                    role: 'assistant',
                    content: assistantContent,
                    media_type: 'text',
                    timestamp: new Date().toISOString(),
                },
            ]);

        return {
            status: 'success',
            riskLevel,
            recommendation,
        };

    } catch (error) {
        console.error('submitCheckInService error', error);
        return { status: 'error', error: 'Internal Client Error' };
    }
}

/**
 * Sends a chat message to Gemini (Client-side replacement for /api/chat)
 */
export async function sendChatMessageService(
    message: string,
    history: { role: string; content: string }[],
    employeeId: string,
    uiLanguage: string
) {
    try {
        // 1. Fetch User Context (Latest Check-in & Risk)
        let contextString = '';
        const { data: latestCheckin } = await supabaseBrowserClient
            .from('daily_checkins')
            .select(`
                mood_score,
                note_text,
                created_at,
                analysis_logs (
                    risk_level,
                    sentiment,
                    recommendation
                )
            `)
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestCheckin) {
            const analysis = Array.isArray(latestCheckin.analysis_logs)
                ? latestCheckin.analysis_logs[0]
                : latestCheckin.analysis_logs;

            contextString = `
User Context:
- Last Check-in: ${new Date(latestCheckin.created_at).toLocaleDateString()}
- Mood Score: ${latestCheckin.mood_score}/5
- Note: "${latestCheckin.note_text || 'No notes'}"
- Risk Level: ${analysis?.risk_level || 'Unknown'}
- Sentiment: ${analysis?.sentiment || 'Unknown'}
`;
        }

        const baseSystemPrompt = uiLanguage === 'ar'
            ? `أنت "MirrorMe"، مساعد ذكي للصحة النفسية للموظفين.
               دورك هو الاستماع للموظف، تقديم الدعم العاطفي، واقتراح نصائح لتحسين جودة الحياة في العمل.
               تحدث بلهجة ودودة ومهنية. لا تقدم نصائح طبية، بل نصائح عامة للصحة النفسية.`
            : `You are "MirrorMe", an AI wellbeing assistant for employees.
               Your role is to listen, provide emotional support, and suggest tips for work-life balance.
               Be friendly and professional. Do not provide medical advice.`;

        const systemPrompt = `${baseSystemPrompt}\n${contextString}`;

        let responseText = '';
        try {
            // Try IBM first
            responseText = await sendMessageToIBM(message, history, systemPrompt);
        } catch (ibmError) {
            console.warn('IBM Chat failed, falling back to Gemini', ibmError);
            // Fallback to Gemini
            responseText = await sendMessageToGemini(message, history, systemPrompt);
        }

        // Log to Supabase
        await supabaseBrowserClient
            .from('chat_logs')
            .insert([
                {
                    employee_id: employeeId,
                    role: 'user',
                    content: message,
                    media_type: 'text',
                    timestamp: new Date().toISOString(),
                },
                {
                    employee_id: employeeId,
                    role: 'assistant',
                    content: responseText,
                    media_type: 'text',
                    timestamp: new Date().toISOString(),
                },
            ]);

        return { response: responseText };

    } catch (error) {
        console.error('sendChatMessageService error', error);
        throw error;
    }
}

/**
 * Sends a query to the HR AI Assistant with data context
 */
export async function askHRAssistantService(
    question: string,
    history: { role: string; content: string }[],
    uiLanguage: string
) {
    try {
        // 1. Fetch Data Context (HR Summary)
        const summary = await getHRSummaryService();
        const dataContext = JSON.stringify(summary, null, 2);

        const baseSystemPrompt = uiLanguage === 'ar'
            ? `أنت مساعد ذكي لمدير الموارد البشرية. لديك حق الوصول إلى بيانات الصحة النفسية للموظفين (ملخصة).
               أجب عن أسئلة المدير بناءً على البيانات المقدمة. كن تحليليًا ومختصرًا.`
            : `You are an AI assistant for the HR Manager. You have access to summarized employee wellbeing data.
               Answer the manager's questions based on the provided data. Be analytical and concise.`;

        const systemPrompt = `${baseSystemPrompt}\n\nData Context:\n${dataContext}`;

        let responseText = '';
        try {
            // Try IBM first
            responseText = await sendMessageToIBM(question, history, systemPrompt);
        } catch (ibmError) {
            console.warn('IBM HR Chat failed, falling back to Gemini', ibmError);
            // Fallback to Gemini
            responseText = await sendMessageToGemini(question, history, systemPrompt);
        }

        return { response: responseText };

    } catch (error) {
        console.error('askHRAssistantService error', error);
        throw error;
    }
}

/**
 * Fetches HR Summary (Client-side replacement for /api/hr/summary)
 */
export async function getHRSummaryService(): Promise<HRSummary> {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. High Risk Today
        const { data: todayHighRisk, error: todayErr } = await supabaseBrowserClient
            .from('analysis_logs')
            .select('id, risk_level, daily_checkins!inner(created_at)')
            .gte('daily_checkins.created_at', startOfDay)
            .eq('risk_level', 'HIGH');

        if (todayErr) console.error('Error fetching todayHighRisk', todayErr);

        // 2. Total Checkins Today
        const { data: todayCheckins, error: checkinsErr } = await supabaseBrowserClient
            .from('daily_checkins')
            .select('id')
            .gte('created_at', startOfDay);

        if (checkinsErr) console.error('Error fetching todayCheckins', checkinsErr);

        // 3. Dept Stats (Last 7 Days)
        const { data: deptStats, error: deptErr } = await supabaseBrowserClient
            .from('analysis_logs')
            .select('risk_level, daily_checkins!inner(employee_id, created_at, employees!inner(department))')
            .gte('daily_checkins.created_at', sevenDaysAgo);

        if (deptErr) console.error('Error fetching deptStats', deptErr);

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

        return {
            employeesAtHighRiskToday: todayHighRisk?.length ?? 0,
            totalCheckinsToday: todayCheckins?.length ?? 0,
            perDepartment,
        };

    } catch (error) {
        console.error('getHRSummaryService error', error);
        return {
            employeesAtHighRiskToday: 0,
            totalCheckinsToday: 0,
            perDepartment: {}
        };
    }
}
