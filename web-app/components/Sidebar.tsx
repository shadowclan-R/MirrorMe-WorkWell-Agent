'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BarChart2, Settings, Plus, User, Sparkles, LogOut, Plug } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useRole } from '@/contexts/RoleContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';
import ConfirmModal from './ConfirmModal';

type SidebarProps = {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    activeView: 'chat' | 'dashboard' | 'profile' | 'settings' | 'report' | 'integrations';
    setActiveView: (v: 'chat' | 'dashboard' | 'profile' | 'settings' | 'report' | 'integrations') => void;
};

export default function Sidebar({ isOpen, setIsOpen, activeView, setActiveView }: SidebarProps) {
    const { t, language } = useApp();
    const { logout } = useRole();
    const { addNotification } = useNotifications();
    const { employee, chatHistory, chatLoading } = useEmployeeProfile();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const recentConversations = (chatHistory || [])
        .filter((entry) => entry.role === 'user')
        .slice(-5)
        .reverse();

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
            <aside className={clsx(
                "fixed md:static inset-y-0 left-0 z-30 w-64 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col transition-transform duration-300 ease-in-out shadow-xl",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>

                {/* Header / New Chat */}
                <div className="p-4">
                    <button
                        onClick={() => { setActiveView('dashboard'); if (window.innerWidth < 768) setIsOpen(false); }}
                        className="flex items-center gap-2 font-bold text-xl mb-6 px-2"
                    >
                        <div className="w-8 h-8 relative rounded-lg overflow-hidden shadow-lg">
                            <img
                                src="/logo.jpg"
                                alt="MirrorMe Logo"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <span>MirrorMe</span>
                    </button>

                    <button
                        onClick={() => { setActiveView('chat'); if (window.innerWidth < 768) setIsOpen(false); }}
                        className="w-full flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white p-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{t('newCheckin')}</span>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">
                        {t('menu')}
                    </div>

                    <NavItem
                        icon={<BarChart2 className="w-5 h-5" />}
                        label={t('dashboard')}
                        active={activeView === 'dashboard'}
                        onClick={() => setActiveView('dashboard')}
                    />

                    <NavItem
                        icon={<Sparkles className="w-5 h-5" />}
                        label={t('viewReport')}
                        active={activeView === 'report'}
                        onClick={() => { setActiveView('report'); if (window.innerWidth < 768) setIsOpen(false); }}
                    />

                    <NavItem
                        icon={<Plug className="w-5 h-5" />}
                        label={language === 'en' ? 'Integrations' : 'التكاملات'}
                        active={activeView === 'integrations'}
                        onClick={() => { setActiveView('integrations'); if (window.innerWidth < 768) setIsOpen(false); }}
                    />

                    <NavItem
                        icon={<User className="w-5 h-5" />}
                        label={t('profile')}
                        active={activeView === 'profile'}
                        onClick={() => { setActiveView('profile'); if (window.innerWidth < 768) setIsOpen(false); }}
                    />

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">
                        {t('history')}
                    </div>

                    <div className="space-y-1">
                        {chatLoading && <HistoryItem label={language === 'en' ? 'Loading conversations...' : 'جارٍ تحميل المحادثات...'} date="" />}
                        {!chatLoading && recentConversations.length === 0 && (
                            <p className="text-xs text-gray-500 px-3 py-2">
                                {language === 'en' ? 'No conversations yet. Start chatting to see history here.' : 'لا توجد محادثات بعد. ابدأ الدردشة لتظهر هنا.'}
                            </p>
                        )}
                        {!chatLoading && recentConversations.map((entry) => (
                            <HistoryItem
                                key={entry.id}
                                label={entry.content?.slice(0, 42) || (language === 'en' ? 'Voice message' : 'رسالة صوتية')}
                                date={formatHistoryTimestamp(entry.timestamp, language)}
                            />
                        ))}
                    </div>
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-700 space-y-2">
                    <div className="flex items-center gap-3 mb-3">
                        {employee?.avatar_url ? (
                            <Image
                                src={employee.avatar_url}
                                alt={employee.full_name ? `${employee.full_name} avatar` : 'Employee avatar'}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-tr from-[var(--accent)] to-[var(--secondary)] rounded-full flex items-center justify-center text-xs font-bold">
                                {getInitials(employee?.full_name)}
                            </div>
                        )}
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{employee?.full_name || 'MirrorMe Member'}</div>
                            <div className="text-xs text-gray-400">{employee?.job_title || (language === 'en' ? 'Wellbeing Champion' : 'سفير العافية')}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => { setActiveView('settings'); if (window.innerWidth < 768) setIsOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{t('settings')}</span>
                    </button>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">{language === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
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

function formatHistoryTimestamp(value?: string, language: 'en' | 'ar' = 'en') {
    if (!value) {
        return language === 'en' ? 'Just now' : 'الآن';
    }
    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) {
        return language === 'en' ? 'Just now' : 'الآن';
    }
    const diffMs = Date.now() - timestamp.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return language === 'en' ? `${days}d ago` : `منذ ${days} يوم`;
    }
    if (hours > 0) {
        return language === 'en' ? `${hours}h ago` : `منذ ${hours} ساعة`;
    }
    if (mins > 0) {
        return language === 'en' ? `${mins}m ago` : `منذ ${mins} دقيقة`;
    }
    return language === 'en' ? 'Just now' : 'الآن';
}

function getInitials(fullName?: string | null) {
    if (!fullName) {
        return 'MM';
    }
    return fullName
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || 'MM';
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                active ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function HistoryItem({ label, date }: { label: string, date: string }) {
    return (
        <button className="w-full flex flex-col items-start px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors text-sm group">
            <span className="truncate w-full text-left">{label}</span>
            <span className="text-[10px] text-gray-600 group-hover:text-gray-500">{date}</span>
        </button>
    );
}
