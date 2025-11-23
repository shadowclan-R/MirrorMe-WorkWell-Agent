'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Activity, BarChart3, PieChart, LineChart, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type LocalizedString = {
    en: string;
    ar: string;
};

type DepartmentKey = 'softwareDevelopment' | 'marketing' | 'sales' | 'humanResources' | 'finance' | 'design';
type DayKey = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
type RiskLevelKey = 'low' | 'medium' | 'high' | 'critical';
type TrendKey = 'improving' | 'stable' | 'declining';
type TranslationCategory = 'departments' | 'days' | 'riskLevels' | 'trends';

type TranslationKeyMap = {
    departments: DepartmentKey;
    days: DayKey;
    riskLevels: RiskLevelKey;
    trends: TrendKey;
};

type TranslationEntry = {
    en: string;
    ar: string;
};

type TranslationMap = { [K in TranslationCategory]: Record<TranslationKeyMap[K], TranslationEntry> };

// Translation maps for analytics content
const translations: TranslationMap = {
    departments: {
        softwareDevelopment: { en: 'Software Development', ar: 'تطوير البرمجيات' },
        marketing: { en: 'Marketing', ar: 'التسويق' },
        sales: { en: 'Sales', ar: 'المبيعات' },
        humanResources: { en: 'Human Resources', ar: 'الموارد البشرية' },
        finance: { en: 'Finance', ar: 'المالية' },
        design: { en: 'Design', ar: 'التصميم' }
    },
    days: {
        saturday: { en: 'Saturday', ar: 'السبت' },
        sunday: { en: 'Sunday', ar: 'الأحد' },
        monday: { en: 'Monday', ar: 'الاثنين' },
        tuesday: { en: 'Tuesday', ar: 'الثلاثاء' },
        wednesday: { en: 'Wednesday', ar: 'الأربعاء' },
        thursday: { en: 'Thursday', ar: 'الخميس' },
        friday: { en: 'Friday', ar: 'الجمعة' }
    },
    riskLevels: {
        low: { en: 'Low', ar: 'منخفض' },
        medium: { en: 'Medium', ar: 'متوسط' },
        high: { en: 'High', ar: 'عالي' },
        critical: { en: 'Critical', ar: 'حرج' }
    },
    trends: {
        improving: { en: 'Improving', ar: 'تحسن' },
        stable: { en: 'Stable', ar: 'مستقر' },
        declining: { en: 'Declining', ar: 'تراجع' }
    }
};

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function HRAnalyticsView() {
    const { language } = useApp();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    // Helper function to translate content
    const translate = <C extends TranslationCategory>(category: C, key: TranslationKeyMap[C]): string => {
        const translation = translations[category][key];
        return language === 'en' ? translation.en : translation.ar;
    };

    const metrics: {
        totalCheckIns: number;
        avgMoodScore: number;
        participationRate: number;
        riskTrend: TrendKey;
        comparisonPrevious: {
            checkIns: number;
            moodScore: number;
            participationRate: number;
        };
    } = {
        totalCheckIns: 1247,
        avgMoodScore: 7.2,
        participationRate: 87,
        riskTrend: 'improving',
        comparisonPrevious: {
            checkIns: 12,
            moodScore: 5,
            participationRate: 3
        }
    };

    const departmentStats: Array<{ name: DepartmentKey; employees: number; avgMood: number; riskScore: number; trend: TrendKey }> = [
        { name: 'softwareDevelopment', employees: 45, avgMood: 7.8, riskScore: 32, trend: 'improving' },
        { name: 'marketing', employees: 28, avgMood: 6.9, riskScore: 45, trend: 'stable' },
        { name: 'sales', employees: 35, avgMood: 6.2, riskScore: 58, trend: 'declining' },
        { name: 'humanResources', employees: 12, avgMood: 7.5, riskScore: 28, trend: 'improving' },
        { name: 'finance', employees: 18, avgMood: 7.1, riskScore: 35, trend: 'stable' },
        { name: 'design', employees: 22, avgMood: 8.1, riskScore: 22, trend: 'improving' },
    ];

    const weeklyTrend: Array<{ day: DayKey; score: number; checkIns: number }> = [
        { day: 'saturday', score: 7.2, checkIns: 145 },
        { day: 'sunday', score: 7.5, checkIns: 152 },
        { day: 'monday', score: 6.8, checkIns: 148 },
        { day: 'tuesday', score: 7.1, checkIns: 143 },
        { day: 'wednesday', score: 7.4, checkIns: 156 },
        { day: 'thursday', score: 7.6, checkIns: 149 },
        { day: 'friday', score: 8.0, checkIns: 98 },
    ];

    const riskDistribution: Array<{ level: RiskLevelKey; count: number; percentage: number; color: string }> = [
        { level: 'low', count: 89, percentage: 62, color: 'bg-green-500' },
        { level: 'medium', count: 32, percentage: 22, color: 'bg-yellow-500' },
        { level: 'high', count: 18, percentage: 13, color: 'bg-orange-500' },
        { level: 'critical', count: 5, percentage: 3, color: 'bg-red-500' },
    ];

    const emergingRiskDrivers: Array<{
        factor: LocalizedString;
        impact: number;
        direction: 'up' | 'down';
        affected: LocalizedString;
        recommendation: LocalizedString;
    }> = [
            {
                factor: { en: 'Sustained overtime windows', ar: 'فترات العمل الإضافي المستمر' },
                impact: 18,
                direction: 'up',
                affected: { en: 'Engineering squads A & C', ar: 'فِرق الهندسة (الفريقان أ وج)' },
                recommendation: {
                    en: 'Freeze non-critical releases, rotate on-call duties, and schedule recovery days next sprint.',
                    ar: 'إيقاف الإصدارات غير الحرجة، تدوير مهام المناوبة، وجدولة أيام استشفاء في السبرنت القادم.'
                }
            },
            {
                factor: { en: 'Low check-in adherence', ar: 'التزام منخفض بالتسجيلات' },
                impact: 11,
                direction: 'up',
                affected: { en: 'Sales enablement pod', ar: 'فريق تمكين المبيعات' },
                recommendation: {
                    en: 'Launch micro nudges before 11 AM and pair with recognition moments after successful pitches.',
                    ar: 'إطلاق تذكيرات قصيرة قبل الساعة 11 صباحًا وربطها بلحظات تقدير بعد العروض الناجحة.'
                }
            },
            {
                factor: { en: 'Manager 1:1 cadence gaps', ar: 'فجوات في اجتماعات المدير الفردية' },
                impact: 9,
                direction: 'down',
                affected: { en: 'People Ops cohort', ar: 'فريق عمليات الأفراد' },
                recommendation: {
                    en: 'Reintroduce bi-weekly wellbeing syncs and share playbooks from high-performing teams.',
                    ar: 'إعادة اجتماعات المتابعة نصف الشهرية للصحة النفسية ومشاركة كتيبات الأداء العالي.'
                }
            }
        ];

    const predictiveOutlook: Array<{
        title: LocalizedString;
        value: string;
        direction: 'up' | 'down';
        delta: number;
        unit: LocalizedString;
        sentiment: 'positive' | 'negative';
        narrative: LocalizedString;
    }> = [
            {
                title: { en: 'Wellbeing index forecast', ar: 'توقع مؤشر الصحة النفسية' },
                value: '82%',
                direction: 'up',
                delta: 4,
                unit: { en: 'pts', ar: 'نقاط' },
                sentiment: 'positive',
                narrative: {
                    en: 'Momentum remains positive if flexible Fridays continue and overtime stays below 6%.',
                    ar: 'الزخم يبقى إيجابيًا إذا استمر العمل المرن يوم الجمعة وبقي العمل الإضافي تحت 6٪.'
                }
            },
            {
                title: { en: 'Attrition probability', ar: 'احتمال التسرب الوظيفي' },
                value: '6.1%',
                direction: 'down',
                delta: 1.7,
                unit: { en: 'pp', ar: 'نقطة مئوية' },
                sentiment: 'positive',
                narrative: {
                    en: 'Risk eases with recognition cadence; watch for spikes if recognition dip exceeds 10 days.',
                    ar: 'الخطر يتراجع مع إيقاع التقدير؛ راقب الارتفاعات إذا تجاوز انقطاع التقدير عشرة أيام.'
                }
            },
            {
                title: { en: 'High-risk population', ar: 'شريحة الخطر العالي' },
                value: '5 people',
                direction: 'down',
                delta: 3,
                unit: { en: 'people', ar: 'أشخاص' },
                sentiment: 'positive',
                narrative: {
                    en: 'Targeted breathing labs reduced red flags; keep pairing with wellness stipends to sustain drop.',
                    ar: 'مختبرات التنفس المستهدفة خفّضت مؤشرات الخطر؛ حافظ على ربطها بمخصصات العافية لضمان الاستمرار.'
                }
            }
        ];

    const wellbeingCorrelations: Array<{
        label: LocalizedString;
        score: number;
        description: LocalizedString;
    }> = [
            {
                label: { en: 'Peer recognition ↔ Mood lift', ar: 'التقدير الزملائي ↔ تحسن المزاج' },
                score: 0.64,
                description: {
                    en: 'Recognition moments within 24h of a check-in drive +0.8 mood uplift.',
                    ar: 'لحظات التقدير خلال 24 ساعة من التسجيل ترفع المزاج بمعدل +0.8.'
                }
            },
            {
                label: { en: 'Meeting load ↔ Stress index', ar: 'عدد الاجتماعات ↔ مؤشر الضغط' },
                score: 0.57,
                description: {
                    en: 'Teams exceeding 24 meetings/week show a 14% stress increase by Thursday.',
                    ar: 'الفرق التي تتجاوز 24 اجتماعًا في الأسبوع تظهر زيادة 14٪ في الضغط بحلول الخميس.'
                }
            },
            {
                label: { en: 'Focus time ↔ Productivity pulse', ar: 'وقت التركيز ↔ نبض الإنتاجية' },
                score: 0.49,
                description: {
                    en: 'Protected 90-minute focus blocks correlate with +11% check-in participation.',
                    ar: 'جلسات التركيز المحمية لمدة 90 دقيقة ترتبط بزيادة 11٪ في المشاركة بالتسجيلات.'
                }
            }
        ];

    const getTimeRangeLabel = (range: TimeRange) => {
        const labels = {
            en: { week: 'This Week', month: 'This Month', quarter: 'This Quarter', year: 'This Year' },
            ar: { week: 'هذا الأسبوع', month: 'هذا الشهر', quarter: 'هذا الربع', year: 'هذا العام' }
        };
        return labels[language === 'en' ? 'en' : 'ar'][range];
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {language === 'en' ? 'Advanced Analytics' : 'التحليلات المتقدمة'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'en' ? 'Deep insights into team wellbeing' : 'رؤى عميقة لصحة الفريق النفسية'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg transition-all ${timeRange === range
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {getTimeRangeLabel(range)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Total Check-ins' : 'إجمالي التسجيلات'}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalCheckIns.toLocaleString()}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +{metrics.comparisonPrevious.checkIns}% {language === 'en' ? 'vs last period' : 'مقارنة بالفترة السابقة'}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Avg Mood Score' : 'متوسط مستوى المزاج'}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.avgMoodScore}/10</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +{metrics.comparisonPrevious.moodScore}% {language === 'en' ? 'improvement' : 'تحسن'}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Participation Rate' : 'معدل المشاركة'}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.participationRate}%</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +{metrics.comparisonPrevious.participationRate}% {language === 'en' ? 'increase' : 'زيادة'}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Risk Trend' : 'اتجاه الخطر'}</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                {translate('trends', metrics.riskTrend)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {language === 'en' ? 'Overall risk decreasing' : 'انخفاض الخطر العام'}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <LineChart className="w-5 h-5" />
                            {language === 'en' ? 'Weekly Mood Trend' : 'اتجاه المزاج الأسبوعي'}
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {weeklyTrend.map((day, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{translate('days', day.day)}</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{day.score}/10</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(day.score / 10) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {day.checkIns} {language === 'en' ? 'check-ins' : 'تسجيل'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            {language === 'en' ? 'Risk Distribution' : 'توزيع الخطر'}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {riskDistribution.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{translate('riskLevels', item.level)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({item.percentage}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{language === 'en' ? 'Total Employees' : 'إجمالي الموظفين'}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {riskDistribution.reduce((acc, item) => acc + item.count, 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {language === 'en' ? 'Department Performance' : 'أداء الأقسام'}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {language === 'en' ? 'Department' : 'القسم'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {language === 'en' ? 'Employees' : 'الموظفين'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {language === 'en' ? 'Avg Mood' : 'متوسط المزاج'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {language === 'en' ? 'Risk Score' : 'درجة الخطر'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {language === 'en' ? 'Trend' : 'الاتجاه'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {departmentStats.map((dept, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{translate('departments', dept.name)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{dept.employees}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{dept.avgMood}/10</div>
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                                                    style={{ width: `${(dept.avgMood / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{dept.riskScore}%</div>
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${dept.riskScore < 35 ? 'bg-green-500' :
                                                        dept.riskScore < 50 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                    style={{ width: `${dept.riskScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            {dept.trend === 'improving' && (
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {translate('trends', dept.trend)}
                                                </span>
                                            )}
                                            {dept.trend === 'stable' && (
                                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm">
                                                    <Activity className="w-4 h-4" />
                                                    {translate('trends', dept.trend)}
                                                </span>
                                            )}
                                            {dept.trend === 'declining' && (
                                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                                                    <TrendingDown className="w-4 h-4" />
                                                    {translate('trends', dept.trend)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Predictive Insights & Correlations */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-orange-200/70 dark:border-orange-800/60">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {language === 'en' ? 'Emerging Risk Drivers' : 'محركات الخطر الناشئة'}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {language === 'en'
                                    ? 'Pinpoint the sources elevating stress so interventions stay proactive'
                                    : 'تحديد مصادر ارتفاع الضغط للحفاظ على التدخلات بشكل استباقي'}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {emergingRiskDrivers.map((driver, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl border border-orange-200/70 dark:border-orange-800/60 bg-orange-50/70 dark:bg-orange-900/20 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {language === 'en' ? driver.factor.en : driver.factor.ar}
                                    </span>
                                    <span
                                        className={`text-sm font-semibold ${driver.direction === 'up'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-green-600 dark:text-green-400'
                                            }`}
                                    >
                                        {driver.direction === 'up' ? '+' : '-'}{driver.impact}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                    {language === 'en' ? driver.affected.en : driver.affected.ar}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                    {language === 'en' ? driver.recommendation.en : driver.recommendation.ar}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-purple-200/70 dark:border-purple-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {language === 'en' ? 'Predictive Outlook' : 'التوقعات المستقبلية'}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {language === 'en'
                                        ? 'Forward-looking scenarios powered by wellbeing, cadence, and HR signals'
                                        : 'سيناريوهات مستقبلية مدعومة بإشارات الصحة والإيقاع التشغيلي وبيانات الموارد البشرية'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {predictiveOutlook.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border border-purple-200/70 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-900/15 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {language === 'en' ? item.title.en : item.title.ar}
                                            </p>
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mt-1">
                                                {item.value}
                                            </p>
                                        </div>
                                        <span
                                            className={`flex items-center gap-1 text-sm font-semibold ${item.sentiment === 'positive'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}
                                        >
                                            {item.direction === 'up' ? '▲' : '▼'} {item.direction === 'up' ? '+' : '-'}
                                            {item.delta}
                                            {language === 'en' ? ` ${item.unit.en}` : ` ${item.unit.ar}`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                        {language === 'en' ? item.narrative.en : item.narrative.ar}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-green-200/70 dark:border-green-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-green-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {language === 'en' ? 'Wellbeing Correlations' : 'الارتباطات المؤثرة'}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {language === 'en'
                                        ? 'Understand which rituals most improve sentiment and participation'
                                        : 'فهم الطقوس التي تعزز المزاج والمشاركة بأكبر قدر'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {wellbeingCorrelations.map((row, index) => {
                                const width = Math.min(Math.abs(row.score) * 100, 100);
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {language === 'en' ? row.label.en : row.label.ar}
                                            </span>
                                            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                                {row.score.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full"
                                                style={{ width: `${width}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                            {language === 'en' ? row.description.en : row.description.ar}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
