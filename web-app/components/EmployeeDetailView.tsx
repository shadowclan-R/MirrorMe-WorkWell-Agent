'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Activity,
    Brain,
    Heart,
    Target,
    Award,
    MessageSquare,
    ArrowLeft,
    BarChart3,
    Zap
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type EmployeeDetail = {
    id: string;
    name: string;
    nameAr: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    joinDate: string;
    avatar: string;
    currentRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    currentMoodScore: number;
    participationRate: number;
    totalCheckIns: number;
    avgResponseTime: string;
};

type CheckInHistory = {
    date: string;
    moodScore: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    stressLevel: number;
    notes: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
};

// Mock data - في المستقبل سيأتي من API
const mockEmployee: EmployeeDetail = {
    id: 'EMP-2341',
    name: 'Sara Al-Fahad',
    nameAr: 'سارة الفهد',
    email: 'sara.alfahad@company.com',
    phone: '+966 50 123 4567',
    department: 'Sales',
    role: 'Senior Sales Manager',
    joinDate: '2023-01-15',
    avatar: 'SA',
    currentRiskLevel: 'high',
    currentMoodScore: 4.2,
    participationRate: 85,
    totalCheckIns: 156,
    avgResponseTime: '2.3h'
};

const mockCheckInHistory: CheckInHistory[] = [
    {
        date: '2025-11-23',
        moodScore: 4,
        sentiment: 'negative',
        stressLevel: 8,
        notes: 'Feeling overwhelmed with current sales targets. Need support.',
        riskLevel: 'high'
    },
    {
        date: '2025-11-22',
        moodScore: 5,
        sentiment: 'neutral',
        stressLevel: 7,
        notes: 'Manageable day but workload is concerning.',
        riskLevel: 'medium'
    },
    {
        date: '2025-11-21',
        moodScore: 3,
        sentiment: 'negative',
        stressLevel: 9,
        notes: 'Very stressful day. Multiple deadlines clashing.',
        riskLevel: 'critical'
    },
    {
        date: '2025-11-20',
        moodScore: 6,
        sentiment: 'neutral',
        stressLevel: 6,
        notes: 'Better than yesterday. Team meeting helped.',
        riskLevel: 'medium'
    },
    {
        date: '2025-11-19',
        moodScore: 7,
        sentiment: 'positive',
        stressLevel: 4,
        notes: 'Good progress on key accounts. Feeling productive.',
        riskLevel: 'low'
    },
];

const mockTrendData = [
    { week: 'Week 1', mood: 7.2, stress: 4.5, engagement: 8.1 },
    { week: 'Week 2', mood: 6.8, stress: 5.2, engagement: 7.5 },
    { week: 'Week 3', mood: 6.1, stress: 6.8, engagement: 6.9 },
    { week: 'Week 4', mood: 4.5, stress: 8.2, engagement: 5.2 },
];

type EmployeeDetailViewProps = {
    employeeId?: string;
    onBack?: () => void;
};

export default function EmployeeDetailView({ onBack }: EmployeeDetailViewProps) {
    const { language } = useApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analytics' | 'recommendations'>('overview');

    const employee = mockEmployee; // في المستقبل: fetch by employeeId from props

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRiskLabel = (level: string) => {
        const labels = {
            low: language === 'en' ? 'Low Risk' : 'خطر منخفض',
            medium: language === 'en' ? 'Medium Risk' : 'خطر متوسط',
            high: language === 'en' ? 'High Risk' : 'خطر عالي',
            critical: language === 'en' ? 'Critical Risk' : 'خطر حرج'
        };
        return labels[level as keyof typeof labels] || level;
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'neutral': return <Activity className="w-4 h-4 text-blue-600" />;
            case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>{language === 'en' ? 'Back to Employees' : 'العودة للموظفين'}</span>
                </button>
            )}

            {/* Employee Header Card */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold">
                        {employee.avatar}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">
                            {language === 'en' ? employee.name : employee.nameAr}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {employee.role}
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                {employee.department}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {employee.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {employee.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {language === 'en' ? 'Joined' : 'انضم'}: {employee.joinDate}
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${employee.currentRiskLevel === 'high' || employee.currentRiskLevel === 'critical'
                                ? 'bg-red-500/20 text-red-100 border-2 border-red-300'
                                : 'bg-white/20 text-white border-2 border-white/30'
                                }`}>
                                {employee.currentRiskLevel === 'high' || employee.currentRiskLevel === 'critical' ? (
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                {getRiskLabel(employee.currentRiskLevel)}
                            </span>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <div className="text-sm text-white/80 mb-1">{language === 'en' ? 'Current Mood' : 'المزاج الحالي'}</div>
                        <div className="text-5xl font-bold">{employee.currentMoodScore.toFixed(1)}</div>
                        <div className="text-sm text-white/80">/10</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{employee.participationRate}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Participation Rate' : 'معدل المشاركة'}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{employee.totalCheckIns}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Total Check-ins' : 'إجمالي التسجيلات'}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{employee.avgResponseTime}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Avg Response Time' : 'متوسط وقت الاستجابة'}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Award className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockCheckInHistory.filter(h => h.moodScore >= 7).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Good Days This Month' : 'أيام جيدة هذا الشهر'}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {[
                        { id: 'overview', icon: <BarChart3 className="w-4 h-4" />, label: language === 'en' ? 'Overview' : 'نظرة عامة' },
                        { id: 'history', icon: <Clock className="w-4 h-4" />, label: language === 'en' ? 'History' : 'السجل' },
                        { id: 'analytics', icon: <Activity className="w-4 h-4" />, label: language === 'en' ? 'Analytics' : 'التحليلات' },
                        { id: 'recommendations', icon: <Brain className="w-4 h-4" />, label: language === 'en' ? 'AI Recommendations' : 'التوصيات الذكية' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'overview' | 'history' | 'analytics' | 'recommendations')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {language === 'en' ? 'Monthly Trend' : 'الاتجاه الشهري'}
                                </h3>
                                <div className="space-y-4">
                                    {mockTrendData.map((data, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.week}</span>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4 text-pink-500" />
                                                        {data.mood.toFixed(1)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="w-4 h-4 text-yellow-500" />
                                                        {data.stress.toFixed(1)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Target className="w-4 h-4 text-blue-500" />
                                                        {data.engagement.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                                                        style={{ width: `${(data.mood / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                                        style={{ width: `${(data.stress / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                        style={{ width: `${(data.engagement / 10) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {language === 'en' ? 'Check-in History' : 'سجل التسجيلات'}
                            </h3>
                            {mockCheckInHistory.map((checkIn, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {checkIn.moodScore}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{checkIn.date}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getSentimentIcon(checkIn.sentiment)}
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {language === 'en' ? 'Stress Level:' : 'مستوى الضغط:'} {checkIn.stressLevel}/10
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(checkIn.riskLevel)}`}>
                                            {getRiskLabel(checkIn.riskLevel)}
                                        </span>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{checkIn.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                        {language === 'en' ? 'Mood Distribution' : 'توزيع المزاج'}
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{language === 'en' ? 'Positive (7-10)' : 'إيجابي (7-10)'}</span>
                                                <span className="font-semibold">35%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: '35%' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{language === 'en' ? 'Neutral (4-6)' : 'محايد (4-6)'}</span>
                                                <span className="font-semibold">45%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '45%' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{language === 'en' ? 'Negative (1-3)' : 'سلبي (1-3)'}</span>
                                                <span className="font-semibold">20%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-full" style={{ width: '20%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                        {language === 'en' ? 'Key Insights' : 'رؤى رئيسية'}
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {language === 'en'
                                                    ? 'Mood declining for 3 consecutive weeks'
                                                    : 'المزاج ينخفض لمدة 3 أسابيع متتالية'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {language === 'en'
                                                    ? 'Stress levels 40% above personal average'
                                                    : 'مستويات الضغط أعلى بنسبة 40% من المتوسط الشخصي'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {language === 'en'
                                                    ? 'Consistent check-ins show good engagement'
                                                    : 'التسجيلات المنتظمة تظهر مشاركة جيدة'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-xl border-2 border-red-300 dark:border-red-700">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-500 text-white rounded-lg flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {language === 'en' ? 'Urgent: Immediate Time Off Recommended' : 'عاجل: إجازة فورية موصى بها'}
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            {language === 'en'
                                                ? 'Employee showing critical burnout symptoms. Recommend 5-7 days immediate leave with wellness support upon return.'
                                                : 'الموظف يظهر أعراض احتراق وظيفي حرجة. يُوصى بإجازة فورية 5-7 أيام مع دعم صحي عند العودة.'}
                                        </p>
                                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all">
                                            {language === 'en' ? 'Schedule Leave' : 'جدولة إجازة'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">💆</div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {language === 'en' ? 'Wellness Session' : 'جلسة صحة نفسية'}
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {language === 'en'
                                                ? 'Schedule a 1-on-1 wellness check-in to discuss workload and stress management strategies.'
                                                : 'جدول اجتماع فردي لمناقشة عبء العمل واستراتيجيات إدارة الضغط.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">🎯</div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {language === 'en' ? 'Workload Adjustment' : 'تعديل عبء العمل'}
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {language === 'en'
                                                ? 'Review current targets and redistribute urgent tasks to team members to reduce immediate pressure.'
                                                : 'راجع الأهداف الحالية وأعد توزيع المهام العاجلة على أعضاء الفريق لتقليل الضغط الفوري.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">🏆</div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {language === 'en' ? 'Recognition Program' : 'برنامج التقدير'}
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {language === 'en'
                                                ? 'Despite challenges, maintain consistent check-ins. Acknowledge dedication with team recognition.'
                                                : 'رغم التحديات، يحافظ على تسجيلات منتظمة. اعترف بالتفاني من خلال التقدير الجماعي.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
