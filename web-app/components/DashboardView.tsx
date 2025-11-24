'use client';

import { Activity, Heart, Brain, Sparkles, Cloud, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { type ActivityLog } from '@/hooks/useSupabaseData';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';
import { useState, useEffect } from 'react';
import { getAIAnalytics } from '@/lib/ibm-service';

export default function DashboardView({ setActiveView }: { setActiveView?: (v: 'chat' | 'dashboard' | 'profile' | 'settings' | 'report') => void }) {
    const { t } = useApp();
    const { employee: employeeData, loading } = useEmployeeProfile();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [aiInsights, setAiInsights] = useState<any>(null);

    useEffect(() => {
        if (employeeData && !loading) {
            getAIAnalytics(employeeData, 'EMPLOYEE')
                .then(insights => {
                    if (insights) setAiInsights(insights);
                })
                .catch(err => console.error('Failed to fetch AI employee insights', err));
        }
    }, [employeeData, loading]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Loading Dashboard...</div>;
    }

    // Derived values
    const twinStatus = employeeData?.twinState?.current_state || 'STABLE';
    const twinSummary = employeeData?.twinState?.summary_text || 'Your twin is analyzing your patterns.';
    const metrics = employeeData?.twinState?.metrics || { physical: 0, emotional: 0, productivity: 0 };
    const firstName = employeeData?.full_name?.split(' ')[0] ?? 'there';

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]"
        >
            {/* Welcome Section */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden"
            >
                {/* Animated background pattern */}
                <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }}
                />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        {employeeData?.avatar_url && (
                            <motion.img
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                src={employeeData.avatar_url}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg object-cover"
                            />
                        )}
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-bold mb-2"
                            >
                                {t('welcome')}, {firstName}! 👋
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.9 }}
                                transition={{ delay: 0.3 }}
                            >
                                أهلاً بعودتك، {firstName}!
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.4 }}
                                className="mt-3 text-sm"
                            >
                                Today is <span className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </motion.p>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="hidden md:flex items-center gap-4"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Cloud className="w-16 h-16 text-white opacity-80" />
                        </motion.div>
                        <div>
                            <p className="text-4xl font-bold">24°C</p>
                            <p className="text-sm opacity-80">Partly Cloudy</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Digital Twin Metrics Cards (Physical, Emotional, Productivity) */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <StatCard
                    icon={<Activity className="w-6 h-6 text-white" />}
                    label="Physical State"
                    labelAr="الحالة الجسدية"
                    value={metrics.physical + '%'}
                    gradient="from-emerald-400 to-teal-500"
                />
                <StatCard
                    icon={<Heart className="w-6 h-6 text-white" />}
                    label="Emotional State"
                    labelAr="الحالة العاطفية"
                    value={metrics.emotional + '%'}
                    gradient="from-rose-400 to-pink-500"
                />
                <StatCard
                    icon={<Sparkles className="w-6 h-6 text-white" />}
                    label="Productivity"
                    labelAr="الإنتاجية"
                    value={metrics.productivity + '%'}
                    gradient="from-blue-400 to-indigo-500"
                />
            </motion.div>

            {/* Digital Twin Insights */}
            <motion.div
                variants={itemVariants}
                className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {t('twinStatus')}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">حالة توأمك الرقمي</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 p-5 rounded-xl border border-[var(--accent)]/30">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">
                                {twinStatus === 'STABLE' ? '😊' : (twinStatus === 'UNDER_PRESSURE' ? '😓' : '😐')}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-[var(--text-primary)] mb-1">{twinStatus.replace('_', ' ')}</p>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {twinSummary}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Activity History / Integrations */}
            <motion.div
                variants={itemVariants}
                className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]"
            >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                    Activity History / سجل النشاطات
                </h3>
                <div className="space-y-4">
                    {employeeData?.activityLogs?.map((log: ActivityLog, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors border border-transparent hover:border-[var(--border)]">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm
                                ${log.activity_type.includes('SLACK') ? 'bg-[#4A154B]' :
                                    log.activity_type.includes('TEAMS') ? 'bg-[#6264A7]' :
                                        log.activity_type.includes('JIRA') ? 'bg-[#0052CC]' :
                                            log.activity_type.includes('CRM') ? 'bg-orange-500' : 'bg-gray-500'}`}
                            >
                                {log.activity_type.substring(0, 1)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--text-primary)]">{log.description}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{log.activity_type.replace('_', ' ')} • {new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-xs font-semibold text-[var(--text-secondary)]">
                                {log.duration_minutes && log.duration_minutes > 0 ? `${log.duration_minutes} min` : ''}
                            </div>
                        </div>
                    ))}
                    {(!employeeData?.activityLogs || employeeData.activityLogs.length === 0) && (
                        <p className="text-sm text-gray-500">No recent activity detected.</p>
                    )}
                </div>
            </motion.div>

            {/* AI-Powered Insights */}
            <motion.div
                variants={itemVariants}
                className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]"
            >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                    {t('recentInsights')} / رؤى حديثة
                </h3>

                <div className="space-y-3">
                    {/* Display Live AI Insights if available, else stored insights */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {aiInsights?.insights?.map((insight: any, idx: number) => (
                        <InsightItem
                            key={`ai-${idx}`}
                            date="Just now"
                            emoji="🤖"
                            text={insight.description || insight.title}
                            textAr="رؤية مباشرة من الذكاء الاصطناعي"
                        />
                    ))}

                    {!aiInsights && employeeData?.insights?.slice(0, 3).map((insight: { created_at: string; sentiment: string | null; recommendation: string | null }, idx: number) => (
                        <InsightItem
                            key={idx}
                            date={new Date(insight.created_at).toLocaleDateString()}
                            emoji={insight.sentiment === 'POSITIVE' ? '🌟' : '⚠️'}
                            text={insight.recommendation || ''}
                            textAr="توصية بناءً على تحليلك الأخير"
                        />
                    ))}

                    {(!aiInsights && (!employeeData?.insights || employeeData.insights.length === 0)) && (
                        <p className="text-sm text-gray-500">No insights available yet. Complete a check-in!</p>
                    )}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <ActionCard
                    title={t('startCheckin')}
                    titleAr="ابدأ تسجيل يومي"
                    description="Share how you're feeling right now"
                    icon={<Heart className="w-8 h-8" />}
                    gradient="from-[var(--primary)] to-sky-500"
                    onClick={() => setActiveView?.('chat')}
                />
                <ActionCard
                    title={t('viewReport')}
                    titleAr="حالة توأمك الرقمي"
                    description="View your complete wellbeing analytics"
                    icon={<Brain className="w-8 h-8" />}
                    gradient="from-[var(--secondary)] to-violet-500"
                    onClick={() => setActiveView?.('report')}
                />
            </motion.div>
        </motion.div>
    );
}

function StatCard({
    icon,
    label,
    labelAr,
    value,
    gradient,
}: {
    icon: React.ReactNode;
    label: string;
    labelAr: string;
    value: string;
    gradient: string;
}) {
    // Extract numeric value for progress bar (if applicable)
    const numericValue = value.includes('%') ? parseInt(value) : null;
    const progressValue = numericValue || (value === 'Good' ? 85 : value === 'Low' ? 25 : parseInt(value) * 20);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
        >
            {/* Animated Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md`}
                    >
                        {icon}
                    </motion.div>
                    <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">{labelAr}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>

                {/* Progress Bar */}
                <div className="mt-3 bg-[var(--muted)] rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValue}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function InsightItem({
    date,
    emoji,
    text,
    textAr,
}: {
    date: string;
    emoji: string;
    text: string;
    textAr: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02, x: 5 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 p-4 rounded-lg hover:bg-[var(--muted)] transition-all cursor-pointer group border border-transparent hover:border-[var(--border)] shadow-sm hover:shadow-md"
        >
            <motion.div
                whileHover={{ scale: 1.3, rotate: 10 }}
                className="text-2xl transition-transform"
            >
                {emoji}
            </motion.div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[var(--text-secondary)] font-medium">{date}</p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="text-xs text-[var(--primary)] font-semibold"
                    >
                        →
                    </motion.div>
                </div>
                <p className="text-sm text-[var(--text-primary)] font-medium">{text}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 italic">{textAr}</p>
            </div>
        </motion.div>
    );
}

function ActionCard({
    title,
    titleAr,
    description,
    icon,
    gradient,
    onClick,
}: {
    title: string;
    titleAr: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    onClick?: () => void;
}) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl text-left group relative overflow-hidden`}
        >
            {/* Animated shimmer effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />

            <div className="relative z-10">
                <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                >
                    {icon}
                </motion.div>
                <h4 className="font-semibold text-xl mb-1">{title}</h4>
                <p className="text-sm opacity-90 mb-2">{titleAr}</p>
                <p className="text-sm opacity-80">{description}</p>

                {/* Animated arrow indicator */}
                <motion.div
                    className="absolute bottom-4 right-4"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="text-2xl">→</span>
                </motion.div>
            </div>
        </motion.button>
    );
}
