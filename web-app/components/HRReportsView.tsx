'use client';

import { useState } from 'react';
import { FileText, Download, Filter, Calendar, Users, TrendingUp, Clock, CheckCircle2, FileDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type LocalizedCopy = {
    en: string;
    ar: string;
};

type Report = {
    id: string;
    title: LocalizedCopy;
    type: 'wellbeing' | 'risk' | 'engagement' | 'trends' | 'custom';
    period: LocalizedCopy;
    generatedDate: string;
    status: 'completed' | 'pending' | 'scheduled';
    fileSize: string;
    format: 'PDF' | 'Excel' | 'CSV';
};

const mockReports: Report[] = [
    {
        id: '1',
        title: { en: 'Monthly Wellbeing Report', ar: 'تقرير الصحة النفسية الشهري' },
        type: 'wellbeing',
        period: { en: 'November 2025', ar: 'نوفمبر 2025' },
        generatedDate: '2025-11-20',
        status: 'completed',
        fileSize: '2.4 MB',
        format: 'PDF'
    },
    {
        id: '2',
        title: { en: 'Quarterly Risk Analysis', ar: 'تحليل المخاطر الربع سنوي' },
        type: 'risk',
        period: { en: 'Q4 2025', ar: 'الربع الرابع 2025' },
        generatedDate: '2025-11-15',
        status: 'completed',
        fileSize: '1.8 MB',
        format: 'Excel'
    },
    {
        id: '3',
        title: { en: 'Weekly Engagement Score', ar: 'مستوى المشاركة الأسبوعي' },
        type: 'engagement',
        period: { en: 'Week 46', ar: 'أسبوع 46' },
        generatedDate: '2025-11-18',
        status: 'completed',
        fileSize: '856 KB',
        format: 'PDF'
    },
    {
        id: '4',
        title: { en: 'Mood Trends by Department', ar: 'اتجاهات المزاج حسب القسم' },
        type: 'trends',
        period: { en: 'October 2025', ar: 'أكتوبر 2025' },
        generatedDate: '2025-11-01',
        status: 'completed',
        fileSize: '3.2 MB',
        format: 'PDF'
    },
    {
        id: '5',
        title: { en: 'Custom Report - Sales Team', ar: 'تقرير مخصص - فريق المبيعات' },
        type: 'custom',
        period: { en: 'November 2025', ar: 'نوفمبر 2025' },
        generatedDate: '2025-11-22',
        status: 'pending',
        fileSize: '-',
        format: 'Excel'
    },
    {
        id: '6',
        title: { en: 'Annual Wellbeing Report', ar: 'تقرير الصحة السنوي' },
        type: 'wellbeing',
        period: { en: '2025', ar: '2025' },
        generatedDate: '2025-12-01',
        status: 'scheduled',
        fileSize: '-',
        format: 'PDF'
    }
];

const reportTemplates = [
    {
        id: 't1',
        name: { en: 'Comprehensive Wellbeing Report', ar: 'تقرير الصحة النفسية الشامل' },
        description: {
            en: 'Deep analysis of employee wellbeing with tailored recommendations',
            ar: 'تحليل شامل لصحة الموظفين النفسية مع توصيات'
        },
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 't2',
        name: { en: 'Risk Assessment', ar: 'تقييم المخاطر' },
        description: {
            en: 'Identify high-risk employees and departments quickly',
            ar: 'تحديد الموظفين والأقسام ذات الخطورة العالية'
        },
        icon: <Users className="w-5 h-5" />,
        color: 'from-red-500 to-orange-500'
    },
    {
        id: 't3',
        name: { en: 'Engagement Analysis', ar: 'تحليل المشاركة' },
        description: {
            en: 'Monitor platform engagement and response quality',
            ar: 'معدلات المشاركة والتفاعل مع النظام'
        },
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 't4',
        name: { en: 'Time-Series Trends', ar: 'الاتجاهات الزمنية' },
        description: {
            en: 'Track changes over any chosen timeframe',
            ar: 'تتبع التغييرات على مدى فترات زمنية'
        },
        icon: <Clock className="w-5 h-5" />,
        color: 'from-purple-500 to-pink-500'
    }
];

export default function HRReportsView() {
    const { language } = useApp();
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredReports = mockReports.filter(report => {
        const matchesType = filterType === 'all' || report.type === filterType;
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesType && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            completed: language === 'en' ? 'Completed' : 'مكتمل',
            pending: language === 'en' ? 'Pending' : 'قيد الإنشاء',
            scheduled: language === 'en' ? 'Scheduled' : 'مجدول'
        };
        return labels[status as keyof typeof labels] || status;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'wellbeing': return 'text-blue-600 dark:text-blue-400';
            case 'risk': return 'text-red-600 dark:text-red-400';
            case 'engagement': return 'text-green-600 dark:text-green-400';
            case 'trends': return 'text-purple-600 dark:text-purple-400';
            case 'custom': return 'text-orange-600 dark:text-orange-400';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {language === 'en' ? 'Reports & Insights' : 'التقارير والرؤى'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'en' ? 'Generate and download detailed reports' : 'إنشاء وتحميل تقارير مفصلة'}
                    </p>
                </div>
            </div>

            {/* Report Templates */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {language === 'en' ? 'Quick Report Templates' : 'قوالب التقارير السريعة'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportTemplates.map((template) => (
                        <button
                            key={template.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all text-left group"
                        >
                            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${template.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                                {template.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{template.name[language]}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{template.description[language]}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                                <FileDown className="w-4 h-4" />
                                {language === 'en' ? 'Generate Report' : 'إنشاء تقرير'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'en' ? 'Filter by Type' : 'تصفية حسب النوع'}
                        </label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">{language === 'en' ? 'All Types' : 'جميع الأنواع'}</option>
                                <option value="wellbeing">{language === 'en' ? 'Wellbeing' : 'الصحة النفسية'}</option>
                                <option value="risk">{language === 'en' ? 'Risk Assessment' : 'تقييم المخاطر'}</option>
                                <option value="engagement">{language === 'en' ? 'Engagement' : 'المشاركة'}</option>
                                <option value="trends">{language === 'en' ? 'Trends' : 'الاتجاهات'}</option>
                                <option value="custom">{language === 'en' ? 'Custom' : 'مخصص'}</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'en' ? 'Filter by Status' : 'تصفية حسب الحالة'}
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">{language === 'en' ? 'All Statuses' : 'جميع الحالات'}</option>
                            <option value="completed">{language === 'en' ? 'Completed' : 'مكتمل'}</option>
                            <option value="pending">{language === 'en' ? 'Pending' : 'قيد الإنشاء'}</option>
                            <option value="scheduled">{language === 'en' ? 'Scheduled' : 'مجدول'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {language === 'en' ? 'Generated Reports' : 'التقارير المُنشأة'}
                    </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            {report.title[language]}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {report.period[language]}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {report.generatedDate}
                                            </div>
                                            {report.fileSize !== '-' && (
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    {report.fileSize}
                                                </div>
                                            )}
                                            <span className={`font-medium ${getTypeColor(report.type)}`}>
                                                {report.format}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                        {getStatusLabel(report.status)}
                                    </span>
                                    {report.status === 'completed' && (
                                        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            {language === 'en' ? 'Download' : 'تحميل'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {filteredReports.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'No reports found matching your filters' : 'لم يتم العثور على تقارير مطابقة للفلاتر'}
                    </p>
                </div>
            )}

            {/* Custom Report Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {language === 'en' ? 'Need a Custom Report?' : 'تحتاج تقرير مخصص؟'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {language === 'en'
                                ? 'Create customized reports with specific metrics and filters'
                                : 'إنشاء تقارير مخصصة مع مقاييس وفلاتر محددة'}
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 whitespace-nowrap">
                        <FileText className="w-5 h-5" />
                        {language === 'en' ? 'Create Custom Report' : 'إنشاء تقرير مخصص'}
                    </button>
                </div>
            </div>
        </div>
    );
}
