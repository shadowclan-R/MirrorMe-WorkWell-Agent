'use client';

import { useState } from 'react';
import {
    BarChart2,
    Settings,
    Users,
    FileText,
    Bell,
    TrendingUp,
    Calendar,
    LogOut,
    Shield,
    Brain,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useRole } from '@/contexts/RoleContext';
import { useNotifications } from '@/contexts/NotificationContext';
import ConfirmModal from './ConfirmModal';

type HRSidebarProps = {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    activeView: 'dashboard' | 'ai-advisor' | 'employees' | 'analytics' | 'reports' | 'alerts' | 'settings';
    setActiveView: (v: 'dashboard' | 'ai-advisor' | 'employees' | 'analytics' | 'reports' | 'alerts' | 'settings') => void;
};

export default function HRSidebar({ isOpen, setIsOpen, activeView, setActiveView }: HRSidebarProps) {
    const { language } = useApp();
    const { logout } = useRole();
    const { addNotification } = useNotifications();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        addNotification({
            type: 'info',
            title: 'Logged Out Successfully',
            titleAr: 'تم تسجيل الخروج بنجاح',
            message: 'You have been logged out. See you soon!',
            messageAr: 'تم تسجيل خروجك. نراك قريبًا!',
            icon: <LogOut className="w-5 h-5" />,
            category: 'system'
        });
        setTimeout(() => logout(), 500);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    'fixed md:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl',
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">HR Manager</h1>
                            <p className="text-xs text-purple-200">
                                {language === 'en' ? 'Control Panel' : 'لوحة التحكم'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 px-3 mt-4">
                        {language === 'en' ? 'Main Menu' : 'القائمة الرئيسية'}
                    </div>

                    <NavItem
                        icon={<BarChart2 className="w-5 h-5" />}
                        label={language === 'en' ? 'Dashboard' : 'الرئيسية'}
                        active={activeView === 'dashboard'}
                        onClick={() => {
                            setActiveView('dashboard');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />

                    <NavItem
                        icon={<Brain className="w-5 h-5" />}
                        label={language === 'en' ? 'AI Advisor' : 'المستشار الذكي'}
                        active={activeView === 'ai-advisor'}
                        onClick={() => {
                            setActiveView('ai-advisor');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />

                    <NavItem
                        icon={<Users className="w-5 h-5" />}
                        label={language === 'en' ? 'Employees' : 'الموظفين'}
                        active={activeView === 'employees'}
                        onClick={() => {
                            setActiveView('employees');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />

                    <NavItem
                        icon={<TrendingUp className="w-5 h-5" />}
                        label={language === 'en' ? 'Analytics' : 'التحليلات'}
                        active={activeView === 'analytics'}
                        onClick={() => {
                            setActiveView('analytics');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />

                    <NavItem
                        icon={<FileText className="w-5 h-5" />}
                        label={language === 'en' ? 'Reports' : 'التقارير'}
                        active={activeView === 'reports'}
                        onClick={() => {
                            setActiveView('reports');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />

                    <NavItem
                        icon={<Bell className="w-5 h-5" />}
                        label={language === 'en' ? 'Alerts' : 'التنبيهات'}
                        active={activeView === 'alerts'}
                        badge={8}
                        onClick={() => {
                            setActiveView('alerts');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />

                    <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 px-3 mt-6">
                        {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
                    </div>

                    <QuickAction
                        icon={<Calendar className="w-4 h-4" />}
                        label={language === 'en' ? 'Schedule Meeting' : 'جدولة اجتماع'}
                    />
                    <QuickAction
                        icon={<FileText className="w-4 h-4" />}
                        label={language === 'en' ? 'Generate Report' : 'إنشاء تقرير'}
                    />
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-purple-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                            HR
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium">HR Manager</div>
                            <div className="text-xs text-purple-300">Admin Access</div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setActiveView('settings');
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-purple-700/50 hover:bg-purple-700 p-2 rounded-lg transition-colors mb-2"
                    >
                        <Settings className="w-4 h-4 text-purple-200" />
                        <span className="text-sm text-purple-100">
                            {language === 'en' ? 'Settings' : 'الإعدادات'}
                        </span>
                    </button>

                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/50 hover:bg-red-600 p-2 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 text-red-200" />
                        <span className="text-sm text-red-100">
                            {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                titleAr="تأكيد تسجيل الخروج"
                message="Are you sure you want to logout? You will need to sign in again."
                messageAr="هل أنت متأكد من تسجيل الخروج؟ ستحتاج إلى تسجيل الدخول مرة أخرى."
                confirmText="Yes, Logout"
                confirmTextAr="نعم، تسجيل الخروج"
                cancelText="Cancel"
                cancelTextAr="إلغاء"
                variant="danger"
                language={language}
            />
        </>
    );
}

function NavItem({
    icon,
    label,
    active,
    badge,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: number;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                active
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-purple-100 hover:bg-purple-700/50 hover:text-white'
            )}
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                    {badge}
                </span>
            )}
        </button>
    );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700/30 hover:text-white transition-colors text-sm">
            {icon}
            <span className="text-left">{label}</span>
        </button>
    );
}
