'use client';

import { useState } from 'react';
import { Search, Filter, UserPlus, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import EmployeeDetailView from './EmployeeDetailView';

type TranslationEntry = { en: string; ar: string };
type EmployeeTranslationCategory = 'departments' | 'roles' | 'moodTrends' | 'riskLevels' | 'timeReferences';

const translations: Record<EmployeeTranslationCategory, Record<string, TranslationEntry>> = {
    departments: {
        'تطوير البرمجيات': { en: 'Software Development', ar: 'تطوير البرمجيات' },
        'التسويق': { en: 'Marketing', ar: 'التسويق' },
        'المبيعات': { en: 'Sales', ar: 'المبيعات' },
        'الموارد البشرية': { en: 'Human Resources', ar: 'الموارد البشرية' },
        'المالية': { en: 'Finance', ar: 'المالية' },
        'التصميم': { en: 'Design', ar: 'التصميم' }
    },
    roles: {
        'مطور أول': { en: 'Senior Developer', ar: 'مطور أول' },
        'مدير تسويق': { en: 'Marketing Manager', ar: 'مدير تسويق' },
        'أخصائي موارد بشرية': { en: 'HR Specialist', ar: 'أخصائي موارد بشرية' },
        'مسؤول مبيعات': { en: 'Sales Executive', ar: 'مسؤول مبيعات' },
        'مطور': { en: 'Developer', ar: 'مطور' },
        'مصمم UI/UX': { en: 'UI/UX Designer', ar: 'مصمم UI/UX' }
    },
    moodTrends: {
        improving: { en: 'Improving', ar: 'تحسن' },
        stable: { en: 'Stable', ar: 'مستقر' },
        declining: { en: 'Declining', ar: 'تراجع' }
    },
    riskLevels: {
        low: { en: 'Low', ar: 'منخفض' },
        medium: { en: 'Medium', ar: 'متوسط' },
        high: { en: 'High', ar: 'عالي' },
        critical: { en: 'Critical', ar: 'حرج' }
    },
    timeReferences: {
        'منذ ساعة': { en: '1 hour ago', ar: 'منذ ساعة' },
        'منذ ساعتين': { en: '2 hours ago', ar: 'منذ ساعتين' },
        'منذ 4 ساعات': { en: '4 hours ago', ar: 'منذ 4 ساعات' },
        'منذ 5 ساعات': { en: '5 hours ago', ar: 'منذ 5 ساعات' },
        'منذ يوم': { en: '1 day ago', ar: 'منذ يوم' },
        'منذ 3 أيام': { en: '3 days ago', ar: 'منذ 3 أيام' }
    }
};

type Employee = {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastCheckIn: string;
    moodTrend: 'improving' | 'stable' | 'declining';
    checkInsThisWeek: number;
};

const mockEmployees: Employee[] = [
    {
        id: '1',
        name: 'أحمد محمد',
        email: 'ahmed@company.com',
        department: 'تطوير البرمجيات',
        role: 'مطور أول',
        riskLevel: 'low',
        lastCheckIn: 'منذ ساعتين',
        moodTrend: 'stable',
        checkInsThisWeek: 5
    },
    {
        id: '2',
        name: 'فاطمة علي',
        email: 'fatima@company.com',
        department: 'التسويق',
        role: 'مدير تسويق',
        riskLevel: 'high',
        lastCheckIn: 'منذ يوم',
        moodTrend: 'declining',
        checkInsThisWeek: 2
    },
    {
        id: '3',
        name: 'خالد سعيد',
        email: 'khaled@company.com',
        department: 'الموارد البشرية',
        role: 'أخصائي موارد بشرية',
        riskLevel: 'medium',
        lastCheckIn: 'منذ 4 ساعات',
        moodTrend: 'stable',
        checkInsThisWeek: 4
    },
    {
        id: '4',
        name: 'سارة حسن',
        email: 'sara@company.com',
        department: 'المبيعات',
        role: 'مسؤول مبيعات',
        riskLevel: 'critical',
        lastCheckIn: 'منذ 3 أيام',
        moodTrend: 'declining',
        checkInsThisWeek: 1
    },
    {
        id: '5',
        name: 'محمود عبدالله',
        email: 'mahmoud@company.com',
        department: 'تطوير البرمجيات',
        role: 'مطور',
        riskLevel: 'low',
        lastCheckIn: 'منذ ساعة',
        moodTrend: 'improving',
        checkInsThisWeek: 5
    },
    {
        id: '6',
        name: 'نور إبراهيم',
        email: 'noor@company.com',
        department: 'التصميم',
        role: 'مصمم UI/UX',
        riskLevel: 'medium',
        lastCheckIn: 'منذ 5 ساعات',
        moodTrend: 'stable',
        checkInsThisWeek: 3
    }
];

export default function HREmployeesView() {
    const { language } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    const translate = (category: EmployeeTranslationCategory, key: string): string => {
        const entry = translations[category][key];
        if (!entry) {
            return key;
        }
        return language === 'en' ? entry.en : entry.ar;
    };

    // If employee selected, show detail view
    if (selectedEmployeeId) {
        return (
            <EmployeeDetailView
                employeeId={selectedEmployeeId}
                onBack={() => setSelectedEmployeeId(null)}
            />
        );
    }

    const filteredEmployees = mockEmployees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
        const matchesRisk = filterRisk === 'all' || emp.riskLevel === filterRisk;
        return matchesSearch && matchesDept && matchesRisk;
    });

    const departments = Array.from(new Set(mockEmployees.map(e => e.department)));

    const stats = {
        total: mockEmployees.length,
        lowRisk: mockEmployees.filter(e => e.riskLevel === 'low').length,
        mediumRisk: mockEmployees.filter(e => e.riskLevel === 'medium').length,
        highRisk: mockEmployees.filter(e => e.riskLevel === 'high').length,
        criticalRisk: mockEmployees.filter(e => e.riskLevel === 'critical').length,
    };

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
        switch (level) {
            case 'low': return language === 'en' ? 'Low' : 'منخفض';
            case 'medium': return language === 'en' ? 'Medium' : 'متوسط';
            case 'high': return language === 'en' ? 'High' : 'عالي';
            case 'critical': return language === 'en' ? 'Critical' : 'حرج';
            default: return level;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
            case 'stable': return <CheckCircle className="w-4 h-4 text-blue-500" />;
            default: return null;
        }
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {language === 'en' ? 'Employee Management' : 'إدارة الموظفين'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'en' ? 'Monitor and manage employee wellbeing' : 'مراقبة وإدارة صحة الموظفين النفسية'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {language === 'en' ? 'Export' : 'تصدير'}
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        {language === 'en' ? 'Add Employee' : 'إضافة موظف'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Total Employees' : 'إجمالي الموظفين'}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-700 dark:text-green-400">{language === 'en' ? 'Low Risk' : 'خطر منخفض'}</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">{stats.lowRisk}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">{language === 'en' ? 'Medium Risk' : 'خطر متوسط'}</div>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">{stats.mediumRisk}</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-sm text-orange-700 dark:text-orange-400">{language === 'en' ? 'High Risk' : 'خطر عالي'}</div>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">{stats.highRisk}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-700 dark:text-red-400">{language === 'en' ? 'Critical' : 'حرج'}</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">{stats.criticalRisk}</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={language === 'en' ? 'Search employees...' : 'البحث عن موظفين...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">{language === 'en' ? 'All Departments' : 'كل الأقسام'}</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{translate('departments', dept)}</option>
                                ))}
                            </select>
                        </div>
                        <select
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">{language === 'en' ? 'All Risk Levels' : 'كل مستويات الخطر'}</option>
                            <option value="low">{translate('riskLevels', 'low')}</option>
                            <option value="medium">{translate('riskLevels', 'medium')}</option>
                            <option value="high">{translate('riskLevels', 'high')}</option>
                            <option value="critical">{translate('riskLevels', 'critical')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Employee' : 'الموظف'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Department' : 'القسم'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Role' : 'المنصب'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Risk Level' : 'مستوى الخطر'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Trend' : 'الاتجاه'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Check-ins' : 'التسجيلات'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Last Check-in' : 'آخر تسجيل'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredEmployees.map((employee) => (
                                <tr
                                    key={employee.id}
                                    onClick={() => setSelectedEmployeeId(employee.id)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                                    {employee.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{translate('departments', employee.department)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{translate('roles', employee.role)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(employee.riskLevel)}`}>
                                            {employee.riskLevel === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                            {getRiskLabel(employee.riskLevel)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(employee.moodTrend)}
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {translate('moodTrends', employee.moodTrend)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{employee.checkInsThisWeek}/7</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {translate('timeReferences', employee.lastCheckIn)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'No employees found' : 'لم يتم العثور على موظفين'}
                    </p>
                </div>
            )}
        </div>
    );
}
