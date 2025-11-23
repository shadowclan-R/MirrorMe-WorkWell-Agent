'use client';

import {
    Brain,
    TrendingUp,
    TrendingDown,
    Activity,
    Heart,
    Shield,
    Users,
    Zap,
    Clock,
    Target,
    CheckCircle,
    BarChart3,
    Calendar,
    MessageCircle,
    Smile,
    Sparkles,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
    type WorkLifeBalance,
    type RiskItemEntry,
    type RecommendationEntry,
    type TimelineEvent,
    type DailyCheckin,
} from '@/hooks/useSupabaseData';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';

export default function DigitalTwinReportView() {
    const { language } = useApp();
    const { employee: employeeData, loading } = useEmployeeProfile();

    if (loading) {
        return <div className="p-10 text-center">Loading Report...</div>;
    }

    // Derived Metrics
    const checkins = employeeData?.checkins ?? [];
    const latestInsight = employeeData?.insights?.[0];
    const twinReport = employeeData?.twinReport;

    // Calculate Avg Mood (Health)
    const avgMood = checkins.length > 0
        ? checkins.reduce((acc: number, c) => acc + (c.mood_score || 0), 0) / checkins.length
        : 0;
    const healthScore = twinReport?.health_score ?? Math.round(avgMood * 20);

    const riskLevel = (twinReport?.risk_level as string | undefined) || latestInsight?.risk_level || 'LOW';
    const energySummary = twinReport?.energy_level ?? (avgMood > 3.5 ? 'High' : 'Moderate');
    const focusScoreDisplay = twinReport?.focus_score != null
        ? `${twinReport.focus_score.toFixed(1)}/10`
        : language === 'en' ? 'No data' : 'لا توجد بيانات';
    const taskCompletionDisplay = twinReport?.task_completion != null
        ? `${twinReport.task_completion}%`
        : language === 'en' ? 'No data' : 'لا توجد بيانات';

    const defaultStressProfile = [
        { period: language === 'en' ? 'Morning' : 'الصباح', level: 'Low', percentage: 20 },
        { period: language === 'en' ? 'Midday' : 'منتصف النهار', level: 'Moderate', percentage: 45 },
        { period: language === 'en' ? 'Afternoon' : 'بعد الظهر', level: 'High', percentage: 70 },
        { period: language === 'en' ? 'Evening' : 'المساء', level: 'Low', percentage: 25 },
    ];

    const stressProfile = twinReport?.stress_profile?.length ? twinReport.stress_profile : defaultStressProfile;
    const communicationStats = twinReport?.communication_stats ?? {
        Slack: { messages: 0, engagement: language === 'en' ? 'Unknown' : 'غير معروف' },
    };
    const fallbackWorkLife: WorkLifeBalance = {
        work_hours: { value: '42h', percentage: 70 },
        personal_time: { value: '18h', percentage: 30 },
        sleep_quality: { value: '7.5h avg', percentage: 85 },
    };
    const workLife = twinReport?.work_life_balance ?? fallbackWorkLife;

    const fallbackRiskItems: RiskItemEntry[] = [
        { label: language === 'en' ? 'Burnout Risk' : 'خطر الإرهاق', level: 'Low', color: 'green' },
        { label: language === 'en' ? 'Anxiety Indicators' : 'مؤشرات القلق', level: 'Low', color: 'green' },
        { label: language === 'en' ? 'Social Isolation' : 'العزلة الاجتماعية', level: 'Very Low', color: 'green' },
        { label: language === 'en' ? 'Work Overload' : 'ضغط العمل', level: 'Moderate', color: 'yellow' },
    ];
    const riskItems = twinReport?.risk_items?.length ? twinReport.risk_items : fallbackRiskItems;

    const fallbackRecommendations: RecommendationEntry[] = [
        { title: language === 'en' ? 'Focus Time' : 'وقت التركيز', recommendation: language === 'en' ? 'Block 9-11 AM for deep work when your focus is highest' : 'خصص الفترة 9-11 صباحاً للعمل العميق عندما يكون تركيزك في أعلى مستوياته', priority: 'high' },
        { title: language === 'en' ? 'Stress Management' : 'إدارة الضغط', recommendation: language === 'en' ? 'Take 5-minute mindfulness breaks every 2 hours' : 'خذ فترات راحة 5 دقائق كل ساعتين', priority: 'medium' },
    ];
    const recommendations = twinReport?.recommendations?.length ? twinReport.recommendations : fallbackRecommendations;

    const fallbackTimeline: TimelineEvent[] = [
        { date: 'Nov 20', event: language === 'en' ? 'Achieved 5-day streak of positive check-ins' : 'حققت 5 أيام متتالية من التسجيلات الإيجابية', type: 'success' },
        { date: 'Nov 15', event: language === 'en' ? 'Completed stress management workshop' : 'أكملت ورشة عمل إدارة الضغط', type: 'milestone' },
    ];
    const timeline = twinReport?.timeline?.length ? twinReport.timeline : fallbackTimeline;
    const teamStats = twinReport?.team_interactions;
    const meetingsAttended = teamStats?.meetings ?? employeeData?.activityLogs?.filter((log) => log.activity_type?.includes('MEETING')).length ?? 0;
    const collaborationScore = teamStats?.collaboration_score ?? (meetingsAttended >= 10 ? 'Excellent' : meetingsAttended >= 5 ? 'Good' : 'Developing');
    const responseTime = teamStats?.response_time ?? '< 30 min';

    // Mood Distribution
    const moodCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    checkins.forEach((c: DailyCheckin) => {
        const score = c.mood_score as 1 | 2 | 3 | 4 | 5;
        if (moodCounts[score] !== undefined) moodCounts[score]++;
    });
    const total = checkins.length || 1;

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header - Digital Twin Overview */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white p-8 rounded-2xl shadow-2xl">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {language === 'en' ? 'Digital Twin Status' : 'حالة توأمك الرقمي'}
                                </h1>
                                <p className="text-white/80 text-sm mt-1">
                                    {language === 'en'
                                        ? 'Comprehensive AI-powered wellbeing analysis'
                                        : 'تحليل شامل للصحة النفسية بواسطة الذكاء الاصطناعي'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <OverviewMetric
                                icon={<Heart className="w-5 h-5" />}
                                label={language === 'en' ? 'Overall Health' : 'الصحة العامة'}
                                value={`${healthScore}%`}
                                trend={healthScore > 70 ? 'up' : 'stable'}
                            />
                            <OverviewMetric
                                icon={<Shield className="w-5 h-5" />}
                                label={language === 'en' ? 'Risk Level' : 'مستوى المخاطر'}
                                value={riskLevel}
                                trend={riskLevel === 'HIGH' ? 'down' : 'stable'}
                            />
                            <OverviewMetric
                                icon={<Zap className="w-5 h-5" />}
                                label={language === 'en' ? 'Energy' : 'الطاقة'}
                                value={energySummary}
                                trend="up"
                            />
                            <OverviewMetric
                                icon={<Target className="w-5 h-5" />}
                                label={language === 'en' ? 'Focus' : 'التركيز'}
                                value={focusScoreDisplay}
                                trend="stable"
                            />
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Brain className="w-20 h-20 text-white animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mood Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisCard
                    title={language === 'en' ? 'Mood Patterns (Recent)' : 'أنماط المزاج (مؤخراً)'}
                    icon={<Smile className="w-6 h-6 text-yellow-500" />}
                >
                    <div className="space-y-4 mt-4">
                        <MoodBar
                            emoji="😊"
                            label={language === 'en' ? 'Very Happy' : 'سعيد جداً'}
                            percentage={Math.round((moodCounts[5] / total) * 100)}
                            color="bg-green-500"
                        />
                        <MoodBar
                            emoji="🙂"
                            label={language === 'en' ? 'Happy' : 'سعيد'}
                            percentage={Math.round((moodCounts[4] / total) * 100)}
                            color="bg-blue-500"
                        />
                        <MoodBar
                            emoji="😐"
                            label={language === 'en' ? 'Neutral' : 'محايد'}
                            percentage={Math.round((moodCounts[3] / total) * 100)}
                            color="bg-gray-400"
                        />
                        <MoodBar
                            emoji="😟"
                            label={language === 'en' ? 'Stressed' : 'متوتر'}
                            percentage={Math.round((moodCounts[2] / total) * 100)}
                            color="bg-orange-500"
                        />
                        <MoodBar
                            emoji="😢"
                            label={language === 'en' ? 'Very Stressed' : 'متوتر جداً'}
                            percentage={Math.round((moodCounts[1] / total) * 100)}
                            color="bg-red-500"
                        />
                    </div>

                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>{language === 'en' ? '✓ Insight:' : '✓ رؤية:'}</strong>{' '}
                            {latestInsight?.recommendation || (language === 'en'
                                ? 'Keep maintaining your current routines!'
                                : 'استمر في الحفاظ على روتينك الحالي!')}
                        </p>
                    </div>
                </AnalysisCard>

                {/* Stress Patterns */}
                <AnalysisCard
                    title={language === 'en' ? 'Stress Levels Analysis' : 'تحليل مستويات الضغط'}
                    icon={<Activity className="w-6 h-6 text-red-500" />}
                >
                    <div className="space-y-4 mt-4">
                        {stressProfile.map((entry) => (
                            <StressIndicator
                                key={entry.period}
                                label={entry.period}
                                level={entry.level}
                                percentage={entry.percentage}
                                color={getStressColor(entry.level, entry.percentage)}
                            />
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                            <strong>{language === 'en' ? '⚠ Alert:' : '⚠ تنبيه:'}</strong>{' '}
                            {language === 'en'
                                ? 'Stress peaks in the afternoon. Consider taking short breaks between 2-4 PM.'
                                : 'يرتفع الضغط في فترة بعد الظهر. فكر في أخذ فترات راحة قصيرة بين 2-4 مساءً.'}
                        </p>
                    </div>
                </AnalysisCard>
            </div>

            {/* Productivity & Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MetricCard
                    icon={<Target className="w-8 h-8 text-purple-500" />}
                    title={language === 'en' ? 'Focus Score' : 'درجة التركيز'}
                    value={focusScoreDisplay}
                    change={twinReport?.focus_score ? '+12%' : '--'}
                    trend="up"
                    description={
                        language === 'en'
                            ? 'Your concentration has improved significantly'
                            : 'تحسن تركيزك بشكل ملحوظ'
                    }
                />
                <MetricCard
                    icon={<Zap className="w-8 h-8 text-yellow-500" />}
                    title={language === 'en' ? 'Energy Level' : 'مستوى الطاقة'}
                    value={energySummary}
                    change={twinReport?.energy_level ? '+8%' : '--'}
                    trend="up"
                    description={
                        language === 'en'
                            ? 'Consistent energy throughout the day'
                            : 'طاقة ثابتة طوال اليوم'
                    }
                />
                <MetricCard
                    icon={<CheckCircle className="w-8 h-8 text-green-500" />}
                    title={language === 'en' ? 'Task Completion' : 'إنجاز المهام'}
                    value={taskCompletionDisplay}
                    change={twinReport?.task_completion ? '+5%' : '--'}
                    trend="up"
                    description={
                        language === 'en'
                            ? 'Excellent task management this week'
                            : 'إدارة ممتازة للمهام هذا الأسبوع'
                    }
                />
            </div>

            {/* Social & Communication */}
            <AnalysisCard
                title={language === 'en' ? 'Social Connections & Communication' : 'التواصل الاجتماعي'}
                icon={<Users className="w-6 h-6 text-blue-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                            {language === 'en' ? 'Communication Channels' : 'قنوات التواصل'}
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(communicationStats).map(([platform, stats]) => (
                                <ChannelActivity
                                    key={platform}
                                    platform={platform}
                                    messages={stats.messages}
                                    engagement={stats.engagement}
                                    color={getChannelColor(platform)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                            {language === 'en' ? 'Team Interaction' : 'التفاعل مع الفريق'}
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Meetings Attended' : 'الاجتماعات'}
                                </span>
                                <span className="font-semibold text-[var(--text-primary)]">{meetingsAttended}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Collaboration Score' : 'درجة التعاون'}
                                </span>
                                <span className="font-semibold text-green-600">{collaborationScore}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Response Time' : 'وقت الاستجابة'}
                                </span>
                                <span className="font-semibold text-[var(--text-primary)]">
                                    {responseTime}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>{language === 'en' ? '💡 Insight:' : '💡 رؤية:'}</strong>{' '}
                        {language === 'en'
                            ? 'Your communication is balanced and healthy. You maintain good connections with your team.'
                            : 'تواصلك متوازن وصحي. أنت تحافظ على علاقات جيدة مع فريقك.'}
                    </p>
                </div>
            </AnalysisCard>

            {/* Work-Life Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisCard
                    title={language === 'en' ? 'Work-Life Balance' : 'توازن الحياة والعمل'}
                    icon={<Clock className="w-6 h-6 text-indigo-500" />}
                >
                    <div className="space-y-4 mt-4">
                        {[
                            { key: 'work_hours', labelEn: 'Work Hours', labelAr: 'ساعات العمل', color: 'bg-blue-500' },
                            { key: 'personal_time', labelEn: 'Personal Time', labelAr: 'الوقت الشخصي', color: 'bg-green-500' },
                            { key: 'sleep_quality', labelEn: 'Sleep Quality', labelAr: 'جودة النوم', color: 'bg-purple-500' },
                        ].map((item) => {
                            const metric = workLife?.[item.key as keyof WorkLifeBalance];
                            if (!metric) return null;
                            return (
                                <BalanceBar
                                    key={item.key}
                                    label={language === 'en' ? item.labelEn : item.labelAr}
                                    value={metric.value}
                                    percentage={metric.percentage}
                                    color={item.color}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            <strong>{language === 'en' ? '💡 Recommendation:' : '💡 توصية:'}</strong>{' '}
                            {language === 'en'
                                ? 'Try to increase personal time by 10% for better balance.'
                                : 'حاول زيادة وقتك الشخصي بنسبة 10% لتوازن أفضل.'}
                        </p>
                    </div>
                </AnalysisCard>

                {/* Risk Assessment */}
                <AnalysisCard
                    title={language === 'en' ? 'Risk Assessment' : 'تقييم المخاطر'}
                    icon={<Shield className="w-6 h-6 text-green-500" />}
                >
                    <div className="space-y-4 mt-4">
                        {riskItems?.map((item) => (
                            <RiskItem key={item.label} label={item.label} level={item.level} color={item.color as 'green' | 'yellow' | 'red'} />
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>{language === 'en' ? '✓ Status:' : '✓ الحالة:'}</strong>{' '}
                            {language === 'en'
                                ? 'Your overall risk level is low. Continue your healthy habits!'
                                : 'مستوى المخاطر العام منخفض. استمر في عاداتك الصحية!'}
                        </p>
                    </div>
                </AnalysisCard>
            </div>

            {/* AI Recommendations */}
            <AnalysisCard
                title={
                    language === 'en'
                        ? 'AI-Powered Recommendations'
                        : 'توصيات الذكاء الاصطناعي'
                }
                icon={<Brain className="w-6 h-6 text-purple-600" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {recommendations?.map((rec) => (
                        <RecommendationCard
                            key={rec.title}
                            icon={<Sparkles className="w-5 h-5" />}
                            title={rec.title}
                            recommendation={rec.recommendation}
                            priority={rec.priority}
                        />
                    ))}
                </div>
            </AnalysisCard>

            {/* Progress Timeline */}
            <AnalysisCard
                title={language === 'en' ? '30-Day Progress Timeline' : 'الجدول الزمني (30 يوم)'}
                icon={<Calendar className="w-6 h-6 text-cyan-500" />}
            >
                <div className="space-y-3 mt-4">
                    {timeline?.map((item) => (
                        <TimelineItem key={`${item.date}-${item.event}`} date={item.date} event={item.event} type={item.type} />
                    ))}
                </div>
            </AnalysisCard>

            {/* Export & Actions */}
            <div className="flex gap-4 flex-wrap">
                <button className="flex-1 min-w-[200px] bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {language === 'en' ? 'Export Full Report (PDF)' : 'تصدير التقرير الكامل (PDF)'}
                </button>
                <button className="flex-1 min-w-[200px] bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {language === 'en' ? 'Share with Manager' : 'شارك مع المدير'}
                </button>
                <button className="flex-1 min-w-[200px] bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    {language === 'en' ? 'Get AI Coaching' : 'احصل على التوجيه الذكي'}
                </button>
            </div>
        </div>
    );
}

// Helper Components

function OverviewMetric({
    icon,
    label,
    value,
    trend,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
}) {
    const trendIcons = {
        up: <TrendingUp className="w-4 h-4 text-green-300" />,
        down: <TrendingDown className="w-4 h-4 text-red-300" />,
        stable: <Activity className="w-4 h-4 text-blue-300" />,
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs opacity-80">{label}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{value}</span>
                {trendIcons[trend]}
            </div>
        </div>
    );
}

function AnalysisCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function MoodBar({
    emoji,
    label,
    percentage,
    color,
}: {
    emoji: string;
    label: string;
    percentage: number;
    color: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                    <span>{emoji}</span>
                    {label}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {percentage}%
                </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function StressIndicator({
    label,
    level,
    percentage,
    color,
}: {
    label: string;
    level: string;
    percentage: number;
    color: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{level}</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    title,
    value,
    change,
    trend,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    description: string;
}) {
    return (
        <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--muted)] rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                <div
                    className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                >
                    {trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : (
                        <TrendingDown className="w-4 h-4" />
                    )}
                    {change}
                </div>
            </div>
            <h4 className="text-sm text-[var(--text-secondary)] mb-1">{title}</h4>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-2">{value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{description}</p>
        </div>
    );
}

function ChannelActivity({
    platform,
    messages,
    engagement,
    color,
}: {
    platform: string;
    messages: number;
    engagement: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg">
            <div className={`w-3 h-3 ${color} rounded-full`} />
            <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{platform}</p>
                <p className="text-xs text-[var(--text-secondary)]">{messages} messages</p>
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{engagement}</span>
        </div>
    );
}

function BalanceBar({
    label,
    value,
    percentage,
    color,
}: {
    label: string;
    value: string;
    percentage: number;
    color: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function RiskItem({ label, level, color }: { label: string; level: string; color: string }) {
    const colors = {
        green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };

    return (
        <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
            <span className="text-sm text-[var(--text-secondary)]">{label}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors[color as keyof typeof colors]}`}>
                {level}
            </span>
        </div>
    );
}

function RecommendationCard({
    icon,
    title,
    recommendation,
    priority,
}: {
    icon: React.ReactNode;
    title: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
}) {
    const priorityColors = {
        high: 'border-red-500 bg-red-50 dark:bg-red-900/10',
        medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
        low: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
    };

    return (
        <div className={`border-l-4 ${priorityColors[priority]} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <h5 className="font-semibold text-sm text-[var(--text-primary)]">{title}</h5>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{recommendation}</p>
        </div>
    );
}

function TimelineItem({
    date,
    event,
    type,
}: {
    date: string;
    event: string;
    type: 'success' | 'milestone' | 'warning' | 'info';
}) {
    const typeStyles = {
        success: 'bg-green-500',
        milestone: 'bg-purple-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500',
    };

    return (
        <div className="flex items-start gap-3">
            <div className={`w-3 h-3 ${typeStyles[type]} rounded-full mt-1.5`} />
            <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{event}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{date}</p>
            </div>
        </div>
    );
}

function getStressColor(level: string, percentage: number) {
    const normalized = level.toLowerCase();
    if (normalized.includes('high') || percentage >= 70) {
        return 'bg-orange-500';
    }
    if (normalized.includes('moderate') || percentage >= 40) {
        return 'bg-yellow-500';
    }
    return 'bg-green-500';
}

function getChannelColor(platform: string) {
    const key = platform.toLowerCase();
    if (key.includes('slack')) return 'bg-purple-500';
    if (key.includes('teams')) return 'bg-blue-500';
    if (key.includes('email')) return 'bg-gray-500';
    if (key.includes('crm')) return 'bg-orange-500';
    return 'bg-slate-500';
}
