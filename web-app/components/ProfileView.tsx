'use client';

import Image from 'next/image';
import { User, Mail, Briefcase, MapPin, Calendar, Link2, Slack, MessageSquare, Shield, CheckCircle, XCircle, Github, Linkedin, Phone, MessageCircle, Send, DollarSign, UserCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';

export default function ProfileView() {
    const { language } = useApp();
    const { addNotification } = useNotifications();
    const { employee: employeeData, loading } = useEmployeeProfile();

    const handleConnectDisconnect = (channelName: string, currentStatus: boolean) => {
        const action = currentStatus ? 'disconnected' : 'connected';
        const actionAr = currentStatus ? 'قطع الاتصال' : 'تم الربط';

        addNotification({
            type: currentStatus ? 'warning' : 'success',
            title: `${channelName} ${action === 'connected' ? 'Connected' : 'Disconnected'}`,
            titleAr: `${actionAr} ${channelName}`,
            message: `${channelName} has been ${action} successfully`,
            messageAr: `تم ${actionAr} بنجاح مع ${channelName}`,
            icon: currentStatus ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />,
            category: 'system'
        });
    };

    // Calculate Stats
    const totalCheckins = employeeData?.checkins?.length || 0;
    const insightsCount = employeeData?.insights?.length || 0;

    // Calculate Avg Mood
    let avgMoodLabel = 'N/A';
    if (employeeData?.checkins && employeeData.checkins.length > 0) {
        const sum = employeeData.checkins.reduce((acc: number, curr) => acc + (curr.mood_score || 0), 0);
        const avg = sum / employeeData.checkins.length;
        avgMoodLabel = avg >= 4 ? 'Great' : (avg >= 3 ? 'Good' : 'Fair');
    }

    // Calculate Streak (Simplified)
    // In a real app, we'd check consecutive dates
    const streak = totalCheckins > 0 ? `${Math.min(totalCheckins, 5)} days` : '0 days';

    if (loading) {
        return <div className="p-10 text-center">Loading Profile...</div>;
    }

    if (!employeeData) {
        return <div className="p-10 text-center">Unable to load profile details right now.</div>;
    }

    // Basic Communication Channels - Essential for employee contact
    const communicationChannels = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-5 h-5" />,
            connected: true,
            lastSync: '5 minutes ago',
            gradient: 'from-green-500 to-green-600',
            category: 'Communication',
            essential: true
        },
        {
            name: 'Email',
            icon: <Mail className="w-5 h-5" />,
            connected: true,
            lastSync: 'Just now',
            gradient: 'from-blue-500 to-blue-600',
            category: 'Communication',
            essential: true
        },
        {
            name: 'SMS',
            icon: <Phone className="w-5 h-5" />,
            connected: true,
            lastSync: '10 minutes ago',
            gradient: 'from-purple-500 to-purple-600',
            category: 'Communication',
            essential: true
        },
        {
            name: 'Telegram',
            icon: <Send className="w-5 h-5" />,
            connected: false,
            lastSync: 'Never',
            gradient: 'from-cyan-400 to-blue-500',
            category: 'Communication',
            essential: true
        },
    ];

    // Work Collaboration Tools
    const collaborationChannels = [
        {
            name: 'Slack',
            icon: <Slack className="w-5 h-5" />,
            connected: true,
            lastSync: '2 hours ago',
            gradient: 'from-purple-500 to-purple-600',
            category: 'Collaboration'
        },
        {
            name: 'Microsoft Teams',
            icon: <MessageSquare className="w-5 h-5" />,
            connected: true,
            lastSync: '1 hour ago',
            gradient: 'from-blue-500 to-blue-600',
            category: 'Collaboration'
        },
    ];

    // Professional Networks
    const professionalChannels = [
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            connected: true,
            lastSync: '3 hours ago',
            gradient: 'from-blue-600 to-blue-700',
            category: 'Professional'
        },
        {
            name: 'GitHub',
            icon: <Github className="w-5 h-5" />,
            connected: false,
            lastSync: 'Never',
            gradient: 'from-gray-600 to-gray-700',
            category: 'Professional'
        },
    ];

    // Company Systems - Auto-connected by HR
    const companySystemChannels = [
        {
            name: 'HR System',
            nameAr: 'نظام الموارد البشرية',
            icon: <UserCheck className="w-5 h-5" />,
            connected: true,
            lastSync: 'Auto-sync',
            gradient: 'from-indigo-500 to-indigo-600',
            category: 'Company Systems',
            autoConnected: true,
            description: 'Automatically connected by your organization'
        },
        {
            name: 'Payroll System',
            nameAr: 'نظام الرواتب',
            icon: <DollarSign className="w-5 h-5" />,
            connected: true,
            lastSync: 'Auto-sync',
            gradient: 'from-emerald-500 to-green-600',
            category: 'Company Systems',
            autoConnected: true,
            description: 'Automatically connected by your organization'
        },
    ];

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    {employeeData?.avatar_url ? (
                        <Image
                            src={employeeData.avatar_url}
                            alt={employeeData.full_name ? `${employeeData.full_name} avatar` : 'Employee avatar'}
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-2xl border-4 border-white/30 shadow-xl object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border-4 border-white/30 shadow-xl">
                            {employeeData?.full_name?.substring(0, 2).toUpperCase() || 'ME'}
                        </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-1">{employeeData?.full_name || 'Loading...'}</h1>
                        <p className="text-white/80 mb-3">{employeeData?.job_title || 'Employee'}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Briefcase className="w-4 h-4" />
                                <span>{employeeData?.department || 'General'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <MapPin className="w-4 h-4" />
                                <span>Riyadh, Saudi Arabia</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Joined Nov 2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="hidden md:flex flex-col items-end gap-2">
                        <div className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl font-semibold shadow-lg flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Pro Plan</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label={language === 'en' ? 'Total Check-ins' : 'إجمالي التسجيلات'}
                    value={totalCheckins.toString()}
                    icon="📊"
                    gradient="from-[var(--primary)] to-sky-400"
                />
                <StatCard
                    label={language === 'en' ? 'Current Streak' : 'السلسلة الحالية'}
                    value={streak}
                    icon="🔥"
                    gradient="from-orange-400 to-red-400"
                />
                <StatCard
                    label={language === 'en' ? 'Avg. Mood' : 'متوسط المزاج'}
                    value={avgMoodLabel}
                    icon="😊"
                    gradient="from-[var(--accent)] to-emerald-400"
                />
                <StatCard
                    label={language === 'en' ? 'Insights' : 'الرؤى'}
                    value={insightsCount.toString()}
                    icon="💡"
                    gradient="from-[var(--secondary)] to-violet-400"
                />
            </div>

            {/* Connected Channels */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link2 className="w-6 h-6 text-[var(--primary)]" />
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                                {language === 'en' ? 'Connected Channels' : 'القنوات المتصلة'}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {language === 'en'
                                    ? 'Manage your integration channels'
                                    : 'إدارة قنوات الاتصال الخاصة بك'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basic Communication Channels */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-[var(--text-secondary)]">
                                {language === 'en' ? 'Essential Contact Channels' : 'قنوات التواصل الأساسية'}
                            </h4>
                            <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                                {language === 'en' ? 'Primary' : 'أساسي'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {communicationChannels.map((channel, idx) => (
                                <ChannelCard
                                    key={idx}
                                    name={channel.name}
                                    icon={channel.icon}
                                    connected={channel.connected}
                                    lastSync={channel.lastSync}
                                    gradient={channel.gradient}
                                    onToggle={() => handleConnectDisconnect(channel.name, channel.connected)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Company Systems - Auto-connected */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-[var(--text-secondary)]">
                                {language === 'en' ? 'Company Systems' : 'أنظمة الشركة'}
                            </h4>
                            <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {language === 'en' ? 'Auto-connected' : 'مربوط تلقائيًا'}
                            </span>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
                            <p className="text-xs text-green-700 dark:text-green-300">
                                {language === 'en'
                                    ? '✓ These systems are automatically connected by your organization. No action required.'
                                    : '✓ هذه الأنظمة مربوطة تلقائيًا من قبل مؤسستك. لا يلزم اتخاذ أي إجراء.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companySystemChannels.map((channel, idx) => (
                                <CompanySystemCard
                                    key={idx}
                                    name={channel.name}
                                    nameAr={channel.nameAr}
                                    icon={channel.icon}
                                    gradient={channel.gradient}
                                    description={channel.description}
                                    language={language}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Work Collaboration Tools */}
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                            {language === 'en' ? 'Work Collaboration' : 'التعاون في العمل'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {collaborationChannels.map((channel, idx) => (
                                <ChannelCard
                                    key={idx}
                                    name={channel.name}
                                    icon={channel.icon}
                                    connected={channel.connected}
                                    lastSync={channel.lastSync}
                                    gradient={channel.gradient}
                                    onToggle={() => handleConnectDisconnect(channel.name, channel.connected)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Professional Networks */}
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                            {language === 'en' ? 'Professional Networks' : 'الشبكات المهنية'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {professionalChannels.map((channel, idx) => (
                                <ChannelCard
                                    key={idx}
                                    name={channel.name}
                                    icon={channel.icon}
                                    connected={channel.connected}
                                    lastSync={channel.lastSync}
                                    gradient={channel.gradient}
                                    onToggle={() => handleConnectDisconnect(channel.name, channel.connected)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--primary)]" />
                    {language === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}
                </h3>

                <div className="space-y-4">
                    <InfoRow
                        label={language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                        value="ryan.alfaid@company.com"
                        icon={<Mail className="w-4 h-4" />}
                    />
                    <InfoRow
                        label={language === 'en' ? 'Department' : 'القسم'}
                        value={employeeData?.department || 'Engineering'}
                        icon={<Briefcase className="w-4 h-4" />}
                    />
                    <InfoRow
                        label={language === 'en' ? 'Employee ID' : 'الرقم الوظيفي'}
                        value={employeeData?.id?.substring(0, 8).toUpperCase() || 'EMP-001'}
                        icon={<Shield className="w-4 h-4" />}
                    />
                    <InfoRow
                        label={language === 'en' ? 'Location' : 'الموقع'}
                        value="Riyadh Office - Building A"
                        icon={<MapPin className="w-4 h-4" />}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    gradient,
}: {
    label: string;
    value: string;
    icon: string;
    gradient: string;
}) {
    return (
        <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] hover:shadow-lg transition-all duration-300 group">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                {icon}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    );
}

function ChannelCard({
    name,
    icon,
    connected,
    lastSync,
    gradient,
    onToggle,
}: {
    name: string;
    icon: React.ReactNode;
    connected: boolean;
    lastSync: string;
    gradient: string;
    onToggle?: () => void;
}) {
    return (
        <div className="bg-[var(--muted)] p-4 rounded-xl border border-[var(--border)] hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                    <div>
                        <p className="font-semibold text-[var(--text-primary)]">{name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Last sync: {lastSync}</p>
                    </div>
                </div>
                {connected ? (
                    <CheckCircle className="w-5 h-5 text-[var(--accent)]" />
                ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                )}
            </div>
            <button
                onClick={onToggle}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${connected
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    : 'bg-[var(--primary)] text-white hover:shadow-lg'
                    }`}
            >
                {connected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
}

function CompanySystemCard({
    name,
    nameAr,
    icon,
    gradient,
    description,
    language,
}: {
    name: string;
    nameAr: string;
    icon: React.ReactNode;
    gradient: string;
    description: string;
    language: string;
}) {
    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800 relative overflow-hidden">
            <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    AUTO
                </span>
            </div>
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-[var(--text-primary)] mb-0.5">{name}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-arabic">{nameAr}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {language === 'en' ? '✓ Connected automatically' : '✓ مربوط تلقائيًا'}
                    </p>
                </div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2 border border-green-200/50 dark:border-green-800/50">
                <p className="text-[10px] text-[var(--text-secondary)]">{description}</p>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)]">
                    {icon}
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
        </div>
    );
}
