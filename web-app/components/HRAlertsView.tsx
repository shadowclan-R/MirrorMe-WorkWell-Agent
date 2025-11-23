'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingDown, Clock, CheckCircle2, XCircle, MessageSquare, User, Filter, Bell } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type LocalizedCopy = {
    en: string;
    ar: string;
};

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
type AlertType = 'risk' | 'absence' | 'declining' | 'engagement' | 'feedback';
type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'dismissed';

type Alert = {
    id: string;
    employeeName: LocalizedCopy;
    employeeId: string;
    department: LocalizedCopy;
    severity: AlertSeverity;
    type: AlertType;
    status: AlertStatus;
    title: LocalizedCopy;
    message: LocalizedCopy;
    timestamp: string;
    daysAgo: number;
};

const mockAlerts: Alert[] = [
    {
        id: '1',
        employeeName: { en: 'Sara Hassan', ar: 'سارة حسن' },
        employeeId: 'EMP-2341',
        department: { en: 'Sales', ar: 'المبيعات' },
        severity: 'critical',
        type: 'risk',
        status: 'new',
        title: { en: 'Critical Risk Level', ar: 'مستوى خطر حرج' },
        message: {
            en: 'No check-ins for 3 days; last mood was very negative (2/10).',
            ar: 'لم يتم تسجيل الدخول منذ 3 أيام، آخر تقييم للمزاج كان سلبي جداً (2/10)'
        },
        timestamp: '2025-11-23 09:15',
        daysAgo: 0
    },
    {
        id: '2',
        employeeName: { en: 'Fatima Ali', ar: 'فاطمة علي' },
        employeeId: 'EMP-1892',
        department: { en: 'Marketing', ar: 'التسويق' },
        severity: 'high',
        type: 'declining',
        status: 'acknowledged',
        title: { en: 'Declining Mood Trend', ar: 'اتجاه متراجع في المزاج' },
        message: {
            en: 'Consistent drop in mood over the last two weeks (from 8/10 to 4/10).',
            ar: 'انخفاض مستمر في درجة المزاج على مدار الأسبوعين الماضيين (من 8/10 إلى 4/10)'
        },
        timestamp: '2025-11-22 14:30',
        daysAgo: 1
    },
    {
        id: '3',
        employeeName: { en: 'Ahmed Youssef', ar: 'أحمد يوسف' },
        employeeId: 'EMP-3456',
        department: { en: 'Software Engineering', ar: 'تطوير البرمجيات' },
        severity: 'medium',
        type: 'engagement',
        status: 'new',
        title: { en: 'Engagement Drop', ar: 'انخفاض معدل المشاركة' },
        message: {
            en: 'Only one check-in over the last two weeks vs. the usual five per week.',
            ar: 'تسجيل واحد فقط في الأسبوعين الماضيين، كان المعدل 5 تسجيلات أسبوعياً'
        },
        timestamp: '2025-11-22 10:45',
        daysAgo: 1
    },
    {
        id: '4',
        employeeName: { en: 'Khalid Mohammed', ar: 'خالد محمد' },
        employeeId: 'EMP-4521',
        department: { en: 'People Operations', ar: 'الموارد البشرية' },
        severity: 'medium',
        type: 'feedback',
        status: 'new',
        title: { en: 'Repeated Negative Feedback', ar: 'تعليقات سلبية متكررة' },
        message: {
            en: 'Reported workload pressure and work-life issues in 3 consecutive check-ins.',
            ar: 'ذكر مشاكل في ضغط العمل والتوازن بين الحياة والعمل في 3 تسجيلات متتالية'
        },
        timestamp: '2025-11-21 16:20',
        daysAgo: 2
    },
    {
        id: '5',
        employeeName: { en: 'Noor Ibrahim', ar: 'نور إبراهيم' },
        employeeId: 'EMP-5678',
        department: { en: 'Design', ar: 'التصميم' },
        severity: 'low',
        type: 'absence',
        status: 'resolved',
        title: { en: 'Missed Check-ins', ar: 'غياب عن التسجيل' },
        message: {
            en: 'No check-ins for two days; confirmed employee wellbeing after outreach.',
            ar: 'لم يتم التسجيل لمدة يومين، تم التواصل والتأكد من سلامة الموظف'
        },
        timestamp: '2025-11-20 11:00',
        daysAgo: 3
    },
    {
        id: '6',
        employeeName: { en: 'Mahmoud Abdullah', ar: 'محمود عبدالله' },
        employeeId: 'EMP-6789',
        department: { en: 'Software Engineering', ar: 'تطوير البرمجيات' },
        severity: 'high',
        type: 'risk',
        status: 'acknowledged',
        title: { en: 'Burnout Indicators', ar: 'علامات إجهاد مهني' },
        message: {
            en: 'Repeated reports of exhaustion, long hours, and elevated stress.',
            ar: 'تقارير متكررة عن الإرهاق، ساعات عمل طويلة، ومستوى توتر عالي'
        },
        timestamp: '2025-11-19 13:45',
        daysAgo: 4
    },
    {
        id: '7',
        employeeName: { en: 'Lina Saeed', ar: 'لينا سعيد' },
        employeeId: 'EMP-7890',
        department: { en: 'Finance', ar: 'المالية' },
        severity: 'medium',
        type: 'declining',
        status: 'dismissed',
        title: { en: 'Mood Pattern Shift', ar: 'تغيير في نمط المزاج' },
        message: {
            en: 'Slight but noticeable dip in mood throughout the last month.',
            ar: 'انخفاض طفيف ولكن ملحوظ في مستوى المزاج خلال الشهر الماضي'
        },
        timestamp: '2025-11-18 09:30',
        daysAgo: 5
    },
    {
        id: '8',
        employeeName: { en: 'Omar Hussein', ar: 'عمر حسين' },
        employeeId: 'EMP-8901',
        department: { en: 'Sales', ar: 'المبيعات' },
        severity: 'critical',
        type: 'risk',
        status: 'new',
        title: { en: 'Critical Risk — Immediate Support', ar: 'مستوى خطر حرج - تدخل فوري' },
        message: {
            en: 'Mood rated 1/10 with negative thought patterns; immediate intervention needed.',
            ar: 'تقييم مزاج منخفض للغاية (1/10) مع ذكر أفكار سلبية، يتطلب تدخل فوري'
        },
        timestamp: '2025-11-23 08:00',
        daysAgo: 0
    }
];

export default function HRAlertsView() {
    const { language } = useApp();
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    const filteredAlerts = mockAlerts.filter(alert => {
        const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
        const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
        const matchesType = filterType === 'all' || alert.type === filterType;
        return matchesSeverity && matchesStatus && matchesType;
    });

    const stats = {
        total: mockAlerts.length,
        new: mockAlerts.filter(a => a.status === 'new').length,
        critical: mockAlerts.filter(a => a.severity === 'critical').length,
        acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
    };

    const getSeverityColor = (severity: AlertSeverity) => {
        switch (severity) {
            case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
        }
    };

    const getSeverityBadge = (severity: AlertSeverity) => {
        const colors = {
            critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        };
        const labels = {
            critical: language === 'en' ? 'Critical' : 'حرج',
            high: language === 'en' ? 'High' : 'عالي',
            medium: language === 'en' ? 'Medium' : 'متوسط',
            low: language === 'en' ? 'Low' : 'منخفض'
        };
        return { color: colors[severity], label: labels[severity] };
    };

    const getStatusBadge = (status: AlertStatus) => {
        const colors = {
            new: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            acknowledged: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        };
        const labels = {
            new: language === 'en' ? 'New' : 'جديد',
            acknowledged: language === 'en' ? 'Acknowledged' : 'تم الاطلاع',
            resolved: language === 'en' ? 'Resolved' : 'تم الحل',
            dismissed: language === 'en' ? 'Dismissed' : 'تم التجاهل'
        };
        return { color: colors[status], label: labels[status] };
    };

    const getTypeIcon = (type: AlertType) => {
        switch (type) {
            case 'risk': return <AlertTriangle className="w-5 h-5" />;
            case 'absence': return <Clock className="w-5 h-5" />;
            case 'declining': return <TrendingDown className="w-5 h-5" />;
            case 'engagement': return <User className="w-5 h-5" />;
            case 'feedback': return <MessageSquare className="w-5 h-5" />;
        }
    };

    const handleAcknowledge = (alertId: string) => {
        console.log('Acknowledged alert:', alertId);
        // Here you would update the alert status
    };

    const handleResolve = (alertId: string) => {
        console.log('Resolved alert:', alertId);
        // Here you would update the alert status
    };

    const handleDismiss = (alertId: string) => {
        console.log('Dismissed alert:', alertId);
        // Here you would update the alert status
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-8 h-8" />
                        {language === 'en' ? 'Alerts & Notifications' : 'التنبيهات والإشعارات'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'en' ? 'Monitor and manage critical employee alerts' : 'مراقبة وإدارة تنبيهات الموظفين الحرجة'}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Total Alerts' : 'إجمالي التنبيهات'}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-sm text-purple-700 dark:text-purple-400">{language === 'en' ? 'New Alerts' : 'تنبيهات جديدة'}</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">{stats.new}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-700 dark:text-red-400">{language === 'en' ? 'Critical' : 'حرج'}</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">{stats.critical}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-700 dark:text-blue-400">{language === 'en' ? 'Acknowledged' : 'تم الاطلاع'}</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">{stats.acknowledged}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'en' ? 'Severity' : 'الأهمية'}
                        </label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">{language === 'en' ? 'All Severities' : 'جميع المستويات'}</option>
                                <option value="critical">{language === 'en' ? 'Critical' : 'حرج'}</option>
                                <option value="high">{language === 'en' ? 'High' : 'عالي'}</option>
                                <option value="medium">{language === 'en' ? 'Medium' : 'متوسط'}</option>
                                <option value="low">{language === 'en' ? 'Low' : 'منخفض'}</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'en' ? 'Status' : 'الحالة'}
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">{language === 'en' ? 'All Statuses' : 'جميع الحالات'}</option>
                            <option value="new">{language === 'en' ? 'New' : 'جديد'}</option>
                            <option value="acknowledged">{language === 'en' ? 'Acknowledged' : 'تم الاطلاع'}</option>
                            <option value="resolved">{language === 'en' ? 'Resolved' : 'تم الحل'}</option>
                            <option value="dismissed">{language === 'en' ? 'Dismissed' : 'تم التجاهل'}</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'en' ? 'Type' : 'النوع'}
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">{language === 'en' ? 'All Types' : 'جميع الأنواع'}</option>
                            <option value="risk">{language === 'en' ? 'Risk Alert' : 'تنبيه خطر'}</option>
                            <option value="absence">{language === 'en' ? 'Absence' : 'غياب'}</option>
                            <option value="declining">{language === 'en' ? 'Declining Trend' : 'اتجاه متراجع'}</option>
                            <option value="engagement">{language === 'en' ? 'Engagement' : 'مشاركة'}</option>
                            <option value="feedback">{language === 'en' ? 'Feedback' : 'ملاحظات'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.map((alert) => {
                    const severityBadge = getSeverityBadge(alert.severity);
                    const statusBadge = getStatusBadge(alert.status);

                    return (
                        <div
                            key={alert.id}
                            className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 border border-gray-200 dark:border-gray-700 ${getSeverityColor(alert.severity)} p-6 hover:shadow-lg transition-all`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className={`p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                        {getTypeIcon(alert.type)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {alert.title[language]}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityBadge.color}`}>
                                            {severityBadge.label}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        {alert.message[language]}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">{alert.employeeName[language]}</span>
                                            <span className="text-gray-400">({alert.employeeId})</span>
                                        </div>
                                        <div>{alert.department[language]}</div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {alert.timestamp}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row lg:flex-col gap-2">
                                    {alert.status === 'new' && (
                                        <>
                                            <button
                                                onClick={() => handleAcknowledge(alert.id)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {language === 'en' ? 'Acknowledge' : 'اطلاع'}
                                            </button>
                                            <button
                                                onClick={() => handleDismiss(alert.id)}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {language === 'en' ? 'Dismiss' : 'تجاهل'}
                                            </button>
                                        </>
                                    )}
                                    {alert.status === 'acknowledged' && (
                                        <button
                                            onClick={() => handleResolve(alert.id)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {language === 'en' ? 'Mark Resolved' : 'تم الحل'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredAlerts.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'No alerts found matching your filters' : 'لم يتم العثور على تنبيهات مطابقة للفلاتر'}
                    </p>
                </div>
            )}
        </div>
    );
}
