'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    CheckSquare,
    Database,
    Briefcase,
    Plug,
    CheckCircle2,
    XCircle,
    Mail,
    Video,
    Users,
    Calendar,
    FileText,
    MessageCircle,
    Linkedin,
    Send
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type IntegrationStatus = 'connected' | 'disconnected';

type Integration = {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    icon: React.ReactNode;
    category: string;
    status: IntegrationStatus;
    color: string;
};

type Category = {
    id: string;
    name: string;
    nameAr: string;
    icon: React.ReactNode;
};

export default function IntegrationsView() {
    const { language } = useApp();
    const [activeCategory, setActiveCategory] = useState('communication');
    const [integrations, setIntegrations] = useState<Integration[]>([
        // Communication Tools
        {
            id: 'teams',
            name: 'Microsoft Teams',
            nameAr: 'مايكروسوفت تيمز',
            description: 'Team collaboration and video meetings',
            descriptionAr: 'التعاون الجماعي واجتماعات الفيديو',
            icon: <Users className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            id: 'slack',
            name: 'Slack',
            nameAr: 'سلاك',
            description: 'Team messaging and collaboration',
            descriptionAr: 'المراسلة الجماعية والتعاون',
            icon: <MessageSquare className="w-8 h-8" />,
            category: 'communication',
            status: 'connected',
            color: 'from-purple-500 to-pink-600'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            nameAr: 'واتساب للأعمال',
            description: 'Business messaging platform',
            descriptionAr: 'منصة المراسلة للأعمال',
            icon: <MessageCircle className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-green-500 to-emerald-600'
        },
        {
            id: 'telegram',
            name: 'Telegram',
            nameAr: 'تيليجرام',
            description: 'Secure messaging platform',
            descriptionAr: 'منصة المراسلة الآمنة',
            icon: <Send className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-blue-400 to-cyan-500'
        },
        {
            id: 'zoom',
            name: 'Zoom',
            nameAr: 'زووم',
            description: 'Video conferencing platform',
            descriptionAr: 'منصة المؤتمرات المرئية',
            icon: <Video className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-blue-500 to-blue-700'
        },
        {
            id: 'google-meet',
            name: 'Google Meet',
            nameAr: 'جوجل ميت',
            description: 'Google video meetings',
            descriptionAr: 'اجتماعات جوجل المرئية',
            icon: <Video className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-red-500 to-orange-500'
        },
        {
            id: 'outlook',
            name: 'Outlook',
            nameAr: 'أوتلوك',
            description: 'Email and calendar management',
            descriptionAr: 'إدارة البريد والتقويم',
            icon: <Mail className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-blue-600 to-cyan-600'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            nameAr: 'لينكد إن',
            description: 'Professional networking platform',
            descriptionAr: 'منصة التواصل المهني',
            icon: <Linkedin className="w-8 h-8" />,
            category: 'communication',
            status: 'disconnected',
            color: 'from-blue-700 to-blue-900'
        },

        // Project Management
        {
            id: 'jira',
            name: 'Jira',
            nameAr: 'جيرا',
            description: 'Project tracking and agile management',
            descriptionAr: 'تتبع المشاريع والإدارة الرشيقة',
            icon: <CheckSquare className="w-8 h-8" />,
            category: 'project-management',
            status: 'connected',
            color: 'from-blue-500 to-blue-700'
        },
        {
            id: 'asana',
            name: 'Asana',
            nameAr: 'أسانا',
            description: 'Project and task management',
            descriptionAr: 'إدارة المشاريع والمهام',
            icon: <CheckSquare className="w-8 h-8" />,
            category: 'project-management',
            status: 'disconnected',
            color: 'from-pink-500 to-rose-600'
        },
        {
            id: 'monday',
            name: 'Monday.com',
            nameAr: 'ماندي',
            description: 'Work operating system',
            descriptionAr: 'نظام تشغيل العمل',
            icon: <CheckSquare className="w-8 h-8" />,
            category: 'project-management',
            status: 'disconnected',
            color: 'from-orange-400 to-red-600'
        },
        {
            id: 'clickup',
            name: 'ClickUp',
            nameAr: 'كليك أب',
            description: 'All-in-one productivity platform',
            descriptionAr: 'منصة الإنتاجية الشاملة',
            icon: <CheckSquare className="w-8 h-8" />,
            category: 'project-management',
            status: 'disconnected',
            color: 'from-purple-500 to-purple-700'
        },
        {
            id: 'basecamp',
            name: 'Basecamp',
            nameAr: 'بيس كامب',
            description: 'Project management and team communication',
            descriptionAr: 'إدارة المشاريع والتواصل الجماعي',
            icon: <CheckSquare className="w-8 h-8" />,
            category: 'project-management',
            status: 'disconnected',
            color: 'from-green-600 to-teal-700'
        },
        {
            id: 'trello',
            name: 'Trello',
            nameAr: 'تريلو',
            description: 'Visual project boards',
            descriptionAr: 'لوحات المشاريع المرئية',
            icon: <CheckSquare className="w-8 h-8" />,
            category: 'project-management',
            status: 'disconnected',
            color: 'from-blue-500 to-sky-600'
        },

        // ERP Systems
        {
            id: 'sap',
            name: 'SAP',
            nameAr: 'ساب',
            description: 'Enterprise resource planning',
            descriptionAr: 'تخطيط موارد المؤسسات',
            icon: <Database className="w-8 h-8" />,
            category: 'erp',
            status: 'disconnected',
            color: 'from-blue-700 to-indigo-900'
        },
        {
            id: 'oracle',
            name: 'Oracle',
            nameAr: 'أوراكل',
            description: 'Database and ERP solutions',
            descriptionAr: 'حلول قواعد البيانات وتخطيط الموارد',
            icon: <Database className="w-8 h-8" />,
            category: 'erp',
            status: 'disconnected',
            color: 'from-red-600 to-red-800'
        },
        {
            id: 'dynamics',
            name: 'Microsoft Dynamics',
            nameAr: 'مايكروسوفت داينامكس',
            description: 'Business applications platform',
            descriptionAr: 'منصة تطبيقات الأعمال',
            icon: <Database className="w-8 h-8" />,
            category: 'erp',
            status: 'disconnected',
            color: 'from-cyan-600 to-blue-800'
        },
        {
            id: 'odoo',
            name: 'Odoo',
            nameAr: 'أودو',
            description: 'Open source ERP and CRM',
            descriptionAr: 'تخطيط الموارد المفتوح المصدر',
            icon: <Database className="w-8 h-8" />,
            category: 'erp',
            status: 'disconnected',
            color: 'from-purple-600 to-purple-800'
        },

        // Productivity Tools
        {
            id: 'notion',
            name: 'Notion',
            nameAr: 'نوشن',
            description: 'Notes, docs, and knowledge base',
            descriptionAr: 'الملاحظات والمستندات وقاعدة المعرفة',
            icon: <FileText className="w-8 h-8" />,
            category: 'productivity',
            status: 'disconnected',
            color: 'from-gray-700 to-gray-900'
        },
        {
            id: 'google-workspace',
            name: 'Google Workspace',
            nameAr: 'جوجل وورك سبيس',
            description: 'Docs, Sheets, Drive, and more',
            descriptionAr: 'المستندات والجداول والتخزين والمزيد',
            icon: <FileText className="w-8 h-8" />,
            category: 'productivity',
            status: 'connected',
            color: 'from-yellow-500 to-orange-600'
        },
        {
            id: 'microsoft-365',
            name: 'Microsoft 365',
            nameAr: 'مايكروسوفت 365',
            description: 'Office apps and cloud services',
            descriptionAr: 'تطبيقات أوفيس والخدمات السحابية',
            icon: <FileText className="w-8 h-8" />,
            category: 'productivity',
            status: 'disconnected',
            color: 'from-orange-500 to-red-600'
        },
        {
            id: 'dropbox',
            name: 'Dropbox',
            nameAr: 'دروب بوكس',
            description: 'Cloud file storage and sharing',
            descriptionAr: 'التخزين السحابي ومشاركة الملفات',
            icon: <FileText className="w-8 h-8" />,
            category: 'productivity',
            status: 'disconnected',
            color: 'from-blue-500 to-blue-700'
        },
        {
            id: 'google-calendar',
            name: 'Google Calendar',
            nameAr: 'تقويم جوجل',
            description: 'Schedule and time management',
            descriptionAr: 'إدارة الجدول الزمني والوقت',
            icon: <Calendar className="w-8 h-8" />,
            category: 'productivity',
            status: 'disconnected',
            color: 'from-blue-500 to-indigo-600'
        },
    ]);

    const categories: Category[] = [
        {
            id: 'communication',
            name: 'Communication',
            nameAr: 'الاتصالات',
            icon: <MessageSquare className="w-4 h-4" />
        },
        {
            id: 'project-management',
            name: 'Project Management',
            nameAr: 'إدارة المشاريع',
            icon: <CheckSquare className="w-4 h-4" />
        },
        {
            id: 'erp',
            name: 'ERP Systems',
            nameAr: 'أنظمة تخطيط الموارد',
            icon: <Database className="w-4 h-4" />
        },
        {
            id: 'productivity',
            name: 'Productivity',
            nameAr: 'الإنتاجية',
            icon: <Briefcase className="w-4 h-4" />
        },
    ];

    const filteredIntegrations = integrations.filter(
        (integration) => integration.category === activeCategory
    );

    const connectedCount = integrations.filter(i => i.status === 'connected').length;

    const toggleIntegration = (id: string) => {
        setIntegrations(prev =>
            prev.map(integration =>
                integration.id === id
                    ? {
                        ...integration,
                        status: integration.status === 'connected' ? 'disconnected' : 'connected'
                    }
                    : integration
            )
        );
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center">
                            <Plug className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                {language === 'en' ? 'Integrations' : 'التكاملات'}
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {language === 'en'
                                    ? 'Connect your work tools and platforms'
                                    : 'اربط أدوات ومنصات العمل الخاصة بك'}
                            </p>
                        </div>
                    </div>

                    {/* Connected Count */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
                            <div>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {language === 'en' ? 'Connected' : 'متصل'}
                                </p>
                                <p className="text-lg font-bold text-[var(--text-primary)]">
                                    {connectedCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Categories Tabs - Horizontal Scroll */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2 shadow-sm"
            >
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${activeCategory === category.id
                                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md scale-105'
                                : 'bg-[var(--muted)] text-[var(--text-secondary)] hover:bg-[var(--muted)]/70'
                                }`}
                        >
                            {category.icon}
                            <span className="font-medium text-sm">
                                {language === 'en' ? category.name : category.nameAr}
                            </span>
                            <span className="text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded-full">
                                {integrations.filter(i => i.category === category.id).length}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Integrations Grid */}
            <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {filteredIntegrations.map((integration, index) => (
                    <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onToggle={toggleIntegration}
                        delay={index * 0.05}
                        language={language}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function IntegrationCard({
    integration,
    onToggle,
    delay,
    language,
}: {
    integration: Integration;
    onToggle: (id: string) => void;
    delay: number;
    language: string;
}) {
    const isConnected = integration.status === 'connected';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            whileHover={{ y: -5 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
        >
            {/* Gradient Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${integration.color} opacity-0 group-hover:opacity-5 transition-opacity`}
            />

            {/* Content */}
            <div className="relative z-10 space-y-4">
                {/* Icon & Status */}
                <div className="flex items-start justify-between">
                    <div className={`w-16 h-16 bg-gradient-to-br ${integration.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {integration.icon}
                    </div>
                    <button
                        onClick={() => onToggle(integration.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isConnected
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30'
                            : 'bg-[var(--muted)] text-[var(--text-secondary)] border border-[var(--border)]'
                            }`}
                    >
                        {isConnected ? (
                            <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{language === 'en' ? 'Connected' : 'متصل'}</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" />
                                <span>{language === 'en' ? 'Connect' : 'اربط'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Info */}
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-1">
                        {language === 'en' ? integration.name : integration.nameAr}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {language === 'en' ? integration.description : integration.descriptionAr}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onToggle(integration.id)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${isConnected
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                        : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:shadow-md'
                        }`}
                >
                    {isConnected
                        ? language === 'en'
                            ? 'Disconnect'
                            : 'قطع الاتصال'
                        : language === 'en'
                            ? 'Connect Now'
                            : 'اربط الآن'}
                </button>
            </div>
        </motion.div>
    );
}
