'use client';

import {
    Users,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Activity,
    Heart,
    Shield,
    Brain,
    Search,
    Download,
    Mail,
    BarChart3,
    Clock,
    Target,
    UserPlus,
    Bell,
    Zap,
    Calendar,
    FileText,
    Send,
    Settings,
    MessageSquare,
    X
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useHRData, type EmployeeSummary } from '@/hooks/useSupabaseData';
import { getAIAnalytics } from '@/lib/ibm-service';
import { askHRAssistantService } from '@/lib/client-services';

type TranslationEntry = { en: string; ar: string };
type TranslationCategory = 'departments' | 'timeReferences';
type EmployeeStatus = 'healthy' | 'moderate' | 'at-risk';
type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

type RecommendationCard = {
    type: string;
    employee: string;
    priority: RecommendationPriority;
    icon: ReactNode;
    title: string;
    message: string;
    color: string;
};

const translations: Record<TranslationCategory, Record<string, TranslationEntry>> = {
    departments: {
        Engineering: { en: 'Engineering', ar: 'الهندسة' },
        Marketing: { en: 'Marketing', ar: 'التسويق' },
        Sales: { en: 'Sales', ar: 'المبيعات' },
        HR: { en: 'HR', ar: 'الموارد البشرية' },
        Finance: { en: 'Finance', ar: 'المالية' }
    },
    timeReferences: {
        '2 hours ago': { en: '2 hours ago', ar: 'منذ ساعتين' },
        '5 hours ago': { en: '5 hours ago', ar: 'منذ 5 ساعات' },
        '1 day ago': { en: '1 day ago', ar: 'منذ يوم' },
        '1 hour ago': { en: '1 hour ago', ar: 'منذ ساعة' },
        '3 hours ago': { en: '3 hours ago', ar: 'منذ 3 ساعات' }
    }
};

const getLocalizedValue = (language: string, category: TranslationCategory, key: string): string => {
    const categoryMap = translations[category];
    const entry = categoryMap[key];
    if (!entry) {
        return key;
    }
    return language === 'en' ? entry.en : entry.ar;
};

type HRDashboardViewProps = {
    onNavigateToAIAdvisor?: () => void;
};

export default function HRDashboardView({ onNavigateToAIAdvisor }: HRDashboardViewProps = {}) {
    const { language } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [aiInsights, setAiInsights] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);

    // Fetch Real Data
    const { data: hrData, loading } = useHRData();

    useEffect(() => {
        if (hrData && !loading) {
            const fetchAI = async () => {
                setLoadingAI(true);
                try {
                    const insights = await getAIAnalytics(hrData, 'HR');
                    if (insights) setAiInsights(insights);
                } catch (err) {
                    console.error('Failed to fetch AI analytics', err);
                } finally {
                    setLoadingAI(false);
                }
            };
            void fetchAI();
        }
    }, [hrData, loading]);

    const translate = (category: TranslationCategory, key: string) =>
        getLocalizedValue(language, category, key);

    if (loading) {
        return <div className="p-10 text-center">Loading HR Dashboard...</div>;
    }

    const totalEmployees = hrData?.totalEmployees || 0;
    const activeToday = hrData?.activeToday || 0;
    const highRiskCount = hrData?.highRiskCount || 0;
    const avgWellbeingScore = hrData?.avgWellbeing || 0;

    // Map real employees to dashboard format
    const mockEmployees = hrData?.employees?.slice(0, 5).map((emp: EmployeeSummary, idx: number) => {
        const checkins = [...(emp.daily_checkins ?? [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const lastCheckin = checkins[0];
        const avgMood = checkins.length > 0
            ? checkins.reduce((acc: number, c) => acc + (c.mood_score ?? 0), 0) / checkins.length
            : 3;
        const score = Math.round(avgMood * 20);

        let timeAgo = 'Never';
        if (lastCheckin?.created_at) {
            const now = new Date().getTime();
            const diff = now - new Date(lastCheckin.created_at).getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            if (days > 0) timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
            else if (hours > 0) timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            else timeAgo = 'Just now';
        }

        return {
            id: idx + 1,
            name: emp.full_name,
            department: emp.department,
            status: score >= 80 ? 'healthy' : (score >= 60 ? 'moderate' : 'at-risk'),
            lastCheckIn: timeAgo,
            wellbeingScore: score,
            riskLevel: score >= 60 ? 'low' : 'high',
        };
    }) || [];

    const departments = ['all', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header */}
            <div className="bg-gradient-to-br from-sky-300 via-indigo-300 to-rose-300 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white p-8 rounded-2xl shadow-2xl transition-colors">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {language === 'en' ? 'HR Manager Dashboard' : 'لوحة تحكم الموارد البشرية'}
                                </h1>
                                <p className="text-white/80 text-sm mt-1">
                                    {language === 'en'
                                        ? 'Monitor and manage employee wellbeing across your organization'
                                        : 'راقب وأدر صحة الموظفين في مؤسستك'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <QuickStat
                                icon={<Users className="w-5 h-5" />}
                                label={language === 'en' ? 'Total Employees' : 'إجمالي الموظفين'}
                                value={totalEmployees.toString()}
                            />
                            <QuickStat
                                icon={<Activity className="w-5 h-5" />}
                                label={language === 'en' ? 'Active Today' : 'نشط اليوم'}
                                value={activeToday.toString()}
                            />
                            <QuickStat
                                icon={<AlertTriangle className="w-5 h-5" />}
                                label={language === 'en' ? 'High Risk' : 'خطر عالي'}
                                value={highRiskCount.toString()}
                            />
                            <QuickStat
                                icon={<Heart className="w-5 h-5" />}
                                label={language === 'en' ? 'Avg Wellbeing' : 'متوسط الصحة'}
                                value={`${avgWellbeingScore}%`}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAssistant(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-all"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>{language === 'en' ? 'Ask AI Assistant' : 'اسأل المساعد الذكي'}</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={<TrendingUp className="w-6 h-6 text-green-500" />}
                    title={language === 'en' ? 'Mood Trend' : 'اتجاه المزاج'}
                    value="+12%"
                    subtitle={language === 'en' ? 'vs last week' : 'مقارنة بالأسبوع الماضي'}
                    trend="up"
                />
                <MetricCard
                    icon={<Shield className="w-6 h-6 text-blue-500" />}
                    title={language === 'en' ? 'Low Risk' : 'خطر منخفض'}
                    value="89%"
                    subtitle={language === 'en' ? 'of employees' : 'من الموظفين'}
                    trend="stable"
                />
                <MetricCard
                    icon={<Clock className="w-6 h-6 text-purple-500" />}
                    title={language === 'en' ? 'Avg Response Time' : 'متوسط الاستجابة'}
                    value="4.2h"
                    subtitle={language === 'en' ? 'to check-ins' : 'للتسجيلات'}
                    trend="stable"
                />
                <MetricCard
                    icon={<Zap className="w-6 h-6 text-yellow-500" />}
                    title={language === 'en' ? 'Team Energy' : 'طاقة الفريق'}
                    value="High"
                    subtitle={language === 'en' ? 'overall rating' : 'التقييم العام'}
                    trend="up"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-purple-200/60 dark:border-purple-800/60 transition-colors">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 bg-white/90 dark:bg-slate-900/60 rounded-xl hover:shadow-lg transition-all group border border-gray-200/70 dark:border-slate-700/60">
                        <div className="p-3 bg-gradient-to-br from-sky-300 to-cyan-200 dark:from-sky-500 dark:to-cyan-400 rounded-lg group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            {language === 'en' ? 'Schedule Event' : 'جدولة فعالية'}
                        </span>
                    </button>

                    <button className="flex flex-col items-center gap-2 p-4 bg-white/90 dark:bg-slate-900/60 rounded-xl hover:shadow-lg transition-all group border border-gray-200/70 dark:border-slate-700/60">
                        <div className="p-3 bg-gradient-to-br from-emerald-300 to-teal-200 dark:from-emerald-500 dark:to-teal-400 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            {language === 'en' ? 'Generate Report' : 'إنشاء تقرير'}
                        </span>
                    </button>

                    <button className="flex flex-col items-center gap-2 p-4 bg-white/90 dark:bg-slate-900/60 rounded-xl hover:shadow-lg transition-all group border border-gray-200/70 dark:border-slate-700/60">
                        <div className="p-3 bg-gradient-to-br from-orange-300 to-rose-200 dark:from-orange-500 dark:to-rose-400 rounded-lg group-hover:scale-110 transition-transform">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            {language === 'en' ? 'Send Broadcast' : 'إرسال بث'}
                        </span>
                    </button>

                    <button className="flex flex-col items-center gap-2 p-4 bg-white/90 dark:bg-slate-900/60 rounded-xl hover:shadow-lg transition-all group border border-gray-200/70 dark:border-slate-700/60">
                        <div className="p-3 bg-gradient-to-br from-purple-300 to-pink-200 dark:from-purple-500 dark:to-pink-400 rounded-lg group-hover:scale-110 transition-transform">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            {language === 'en' ? 'Configure' : 'إعدادات'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Alerts and AI Advisory Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AlertsCard language={language} />
                <InsightsCard
                    language={language}
                    onNavigateToAIAdvisor={onNavigateToAIAdvisor}
                    aiData={aiInsights}
                    loading={loadingAI}
                />
            </div>

            {/* Employee List */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-[var(--primary)]" />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {language === 'en' ? 'Employee Overview' : 'نظرة عامة على الموظفين'}
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            {language === 'en' ? 'Add Employee' : 'إضافة موظف'}
                        </button>
                        <button className="px-4 py-2 bg-[var(--muted)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--muted)]/70 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            {language === 'en' ? 'Export' : 'تصدير'}
                        </button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder={
                                language === 'en' ? 'Search employees...' : 'ابحث عن الموظفين...'
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                        <option value="all">
                            {language === 'en' ? 'All Departments' : 'جميع الأقسام'}
                        </option>
                        {departments.slice(1).map((dept) => (
                            <option key={dept} value={dept}>
                                {translate('departments', dept)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Employee Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Name' : 'الاسم'}
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Department' : 'القسم'}
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Status' : 'الحالة'}
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Last Check-in' : 'آخر تسجيل'}
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Score' : 'النتيجة'}
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Actions' : 'الإجراءات'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockEmployees.map((employee) => (
                                <tr
                                    key={employee.id}
                                    className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {employee.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {employee.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-[var(--text-secondary)]">
                                        {translate('departments', employee.department)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <StatusBadge status={employee.status as EmployeeStatus} language={language} />
                                    </td>
                                    <td className="py-4 px-4 text-[var(--text-secondary)] text-sm">
                                        {translate('timeReferences', employee.lastCheckIn)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-semibold ${employee.wellbeingScore >= 80
                                                    ? 'text-green-600'
                                                    : employee.wellbeingScore >= 60
                                                        ? 'text-yellow-600'
                                                        : 'text-red-600'
                                                    }`}
                                            >
                                                {employee.wellbeingScore}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                                                <Brain className="w-4 h-4 text-[var(--primary)]" />
                                            </button>
                                            <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                                                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Department Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DepartmentAnalytics language={language} />
                <TeamHealthScore language={language} />
            </div>

            {/* AI Assistant Modal */}
            {showAssistant && (
                <HRAssistantModal
                    language={language}
                    onClose={() => setShowAssistant(false)}
                />
            )}
        </div>
    );
}

// Helper Components

function HRAssistantModal({ language, onClose }: { language: string; onClose: () => void }) {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        {
            role: 'assistant',
            content: language === 'en'
                ? 'Hello! I have analyzed the latest HR data. Ask me anything about employee wellbeing, risk levels, or department trends.'
                : 'مرحباً! لقد قمت بتحليل أحدث بيانات الموارد البشرية. اسألني أي شيء عن صحة الموظفين، مستويات المخاطر، أو اتجاهات الأقسام.'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { response } = await askHRAssistantService(input, messages, language);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: language === 'en' ? 'Sorry, I encountered an error analyzing the data.' : 'عذراً، واجهت خطأ في تحليل البيانات.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">
                                {language === 'en' ? 'HR AI Assistant' : 'مساعد الموارد البشرية الذكي'}
                            </h3>
                            <p className="text-xs opacity-80">
                                {language === 'en' ? 'Powered by IBM Watsonx' : 'مدعوم بواسطة IBM Watsonx'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-[var(--primary)] text-white rounded-br-sm'
                                : 'bg-[var(--muted)] text-[var(--text-primary)] rounded-bl-sm'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--muted)] p-3 rounded-2xl rounded-bl-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] bg-[var(--card)] rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={language === 'en' ? 'Ask about trends, risks, or specific departments...' : 'اسأل عن الاتجاهات، المخاطر، أو أقسام محددة...'}
                            className="flex-1 px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white/80 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/60 backdrop-blur-sm rounded-xl p-4 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs opacity-80">{label}</span>
            </div>
            <span className="text-2xl font-bold">{value}</span>
        </div>
    );
}

function MetricCard({
    icon,
    title,
    value,
    subtitle,
    trend,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    trend: 'up' | 'down' | 'stable';
}) {
    return (
        <div className="bg-[var(--card)] rounded-xl shadow-sm p-5 border border-[var(--border)] transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/70 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-xl flex items-center justify-center transition-colors">
                    {icon}
                </div>
                {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
            <h4 className="text-sm text-[var(--text-secondary)] mb-1">{title}</h4>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>
    );
}

function StatusBadge({ status, language }: { status: EmployeeStatus; language: string }) {
    const styles: Record<EmployeeStatus, string> = {
        healthy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        moderate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        'at-risk': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };

    const labels: Record<EmployeeStatus, TranslationEntry> = {
        healthy: { en: 'Healthy', ar: 'صحي' },
        moderate: { en: 'Moderate', ar: 'متوسط' },
        'at-risk': { en: 'At Risk', ar: 'معرض للخطر' },
    };

    const label = language === 'en' ? labels[status].en : labels[status].ar;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
            {label}
        </span>
    );
}

function AlertsCard({ language }: { language: string }) {
    const alerts = [
        {
            type: 'high-risk',
            employee: 'Sara Al-Fahad',
            message: language === 'en' ? 'High stress detected' : 'ضغط عالي مكتشف',
            time: '2 hours ago',
        },
        {
            type: 'no-checkin',
            employee: 'Ali Al-Zahrani',
            message: language === 'en' ? 'No check-in for 3 days' : 'لا توجد تسجيلات منذ 3 أيام',
            time: '1 day ago',
        },
        {
            type: 'pattern',
            employee: 'Noura Al-Mutairi',
            message: language === 'en' ? 'Unusual mood pattern' : 'نمط مزاجي غير معتاد',
            time: '5 hours ago',
        },
    ];

    return (
        <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {language === 'en' ? 'Priority Alerts' : 'التنبيهات ذات الأولوية'}
                </h3>
            </div>

            <div className="space-y-3">
                {alerts.map((alert, idx) => (
                    <div
                        key={idx}
                        className="p-4 bg-orange-100/70 dark:bg-orange-900/25 rounded-lg border border-orange-200/70 dark:border-orange-800/60 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-[var(--text-primary)] mb-1">
                                    {alert.employee}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)]">{alert.message}</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-2">
                                    {getLocalizedValue(language, 'timeReferences', alert.time)}
                                </p>
                            </div>
                            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InsightsCard({
    language,
    onNavigateToAIAdvisor,
    aiData,
    loading
}: {
    language: string;
    onNavigateToAIAdvisor?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aiData?: any;
    loading?: boolean;
}) {
    // Parse AI Data if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recommendations: RecommendationCard[] = aiData?.recommendations?.map((rec: any): RecommendationCard => ({
        type: 'ai-generated',
        employee: rec.target || 'Team',
        priority: 'high', // Default priority for AI suggestions
        icon: '🤖',
        title: rec.title,
        message: rec.action,
        color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    })) || [];

    // Use AI recommendations if available, otherwise fallback to hardcoded defaults (full list)
    const displayRecs: RecommendationCard[] = (recommendations.length > 0) ? recommendations : [
        {
            type: 'vacation',
            employee: 'Sara Al-Fahad',
            priority: 'critical',
            icon: '🏖️',
            title: language === 'en' ? 'Urgent: Time Off Recommended' : 'عاجل: إجازة موصى بها',
            message: language === 'en'
                ? 'Sara has shown high stress for 3 consecutive weeks. Recommend 5-7 days vacation to prevent burnout.'
                : 'سارة أظهرت ضغطاً عالياً لمدة 3 أسابيع متتالية. يُوصى بإجازة 5-7 أيام لمنع الاحتراق الوظيفي.',
            color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        },
        {
            type: 'event',
            employee: 'Engineering Team',
            priority: 'high',
            icon: '🎯',
            title: language === 'en' ? 'Team Decompression Event' : 'فعالية تخفيف الضغط',
            message: language === 'en'
                ? 'After 2 months of intensive project work, organize a team building event this weekend to boost morale.'
                : 'بعد شهرين من العمل المكثف على المشروع، نظّم فعالية بناء فريق نهاية الأسبوع لرفع المعنويات.',
            color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        },
        {
            type: 'wellness',
            employee: 'Sales Department',
            priority: 'medium',
            icon: '🧘',
            title: language === 'en' ? 'Wellness Workshop Suggested' : 'ورشة عمل للصحة النفسية',
            message: language === 'en'
                ? 'Sales team stress levels increasing. Schedule a stress management workshop next week.'
                : 'مستويات الضغط في فريق المبيعات ترتفع. جدول ورشة عمل لإدارة الضغط الأسبوع القادم.',
            color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
        }
    ];

    const getPriorityIcon = (priority: RecommendationPriority) => {
        switch (priority) {
            case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'high': return <TrendingUp className="w-4 h-4 text-orange-600" />;
            case 'medium': return <Activity className="w-4 h-4 text-purple-600" />;
            default: return <CheckCircle className="w-4 h-4 text-green-600" />;
        }
    };

    return (
        <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)] lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-lg transition-colors">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {language === 'en' ? 'AI Wellbeing Advisor' : 'المستشار الذكي للصحة النفسية'}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {loading
                                ? (language === 'en' ? 'Analyzing data...' : 'جاري تحليل البيانات...')
                                : (language === 'en'
                                    ? 'Smart recommendations to maintain team wellbeing & prevent burnout'
                                    : 'توصيات ذكية للحفاظ على صحة الفريق ومنع الاحتراق الوظيفي')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onNavigateToAIAdvisor}
                    className="text-sm text-[var(--primary)] hover:underline font-medium hover:scale-105 transition-transform"
                >
                    {language === 'en' ? 'View All →' : 'عرض الكل ←'}
                </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {displayRecs.map((rec, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-xl border-2 ${rec.color} transition-all hover:shadow-md cursor-pointer group`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                {rec.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getPriorityIcon(rec.priority)}
                                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                                        {rec.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] mb-2">
                                    <strong>{language === 'en' ? 'Target:' : 'الهدف:'}</strong> {rec.employee}
                                </p>
                                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                                    {rec.message}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <button className="text-xs px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all">
                                        {language === 'en' ? 'Take Action' : 'اتخذ إجراء'}
                                    </button>
                                    <button className="text-xs px-3 py-1.5 bg-[var(--muted)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--muted)]/70 transition-all">
                                        {language === 'en' ? 'Remind Later' : 'تذكير لاحقاً'}
                                    </button>
                                    <button className="text-xs px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                        {language === 'en' ? 'Dismiss' : 'تجاهل'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>
                        {language === 'en'
                            ? 'AI analyzes patterns, stress levels, engagement metrics, and historical data'
                            : 'الذكاء الاصطناعي يحلل الأنماط، مستويات الضغط، مقاييس المشاركة، والبيانات التاريخية'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {language === 'en' ? 'Updated live' : 'تحديث مباشر'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function DepartmentAnalytics({ language }: { language: string }) {
    const departments = [
        { name: 'Engineering', score: 84, trend: 'up' },
        { name: 'Marketing', score: 72, trend: 'stable' },
        { name: 'Sales', score: 68, trend: 'down' },
        { name: 'HR', score: 91, trend: 'up' },
    ];

    return (
        <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {language === 'en' ? 'Department Health' : 'صحة الأقسام'}
                </h3>
            </div>

            <div className="space-y-4">
                {departments.map((dept) => (
                    <div key={dept.name}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                                {getLocalizedValue(language, 'departments', dept.name)}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                                    {dept.score}%
                                </span>
                                {dept.trend === 'up' && (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                )}
                                {dept.trend === 'down' && (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${dept.score >= 80
                                    ? 'bg-green-500'
                                    : dept.score >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                style={{ width: `${dept.score}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamHealthScore({ language }: { language: string }) {
    return (
        <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[var(--accent)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {language === 'en' ? 'Overall Team Health' : 'الصحة العامة للفريق'}
                </h3>
            </div>

            <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray="502.4"
                            strokeDashoffset="125.6"
                            className="text-[var(--accent)]"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold text-[var(--text-primary)]">78%</span>
                        <span className="text-sm text-[var(--text-secondary)]">
                            {language === 'en' ? 'Good' : 'جيد'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">89%</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {language === 'en' ? 'Low Risk' : 'خطر منخفض'}
                    </p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">5%</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {language === 'en' ? 'High Risk' : 'خطر عالي'}
                    </p>
                </div>
            </div>
        </div>
    );
}
