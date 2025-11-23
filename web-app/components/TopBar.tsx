'use client';

import Image from 'next/image';
import { Menu, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';
import { useRole } from '@/contexts/RoleContext';
import { useHRProfile } from '@/hooks/useSupabaseData';
import NotificationsPanel from './NotificationsPanel';

type TopBarProps = {
    onMenuClick: () => void;
};

export default function TopBar({ onMenuClick }: TopBarProps) {
    const { theme, language, toggleTheme, setLanguage, t } = useApp();
    const { unreadCount } = useNotifications();
    const { employee } = useEmployeeProfile();
    const { role } = useRole();
    const { profile: hrProfile } = useHRProfile();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    const profile = useMemo(() => {
        if (role === 'hr') {
            // Use fetched HR profile if available, otherwise fallback to hardcoded (or loading state)
            const managerName = hrProfile?.full_name || (language === 'en' ? 'Ruqayya Alyamani' : 'رقية اليماني');
            const managerTitle = hrProfile?.role_title || (language === 'en' ? 'HR Director' : 'مديرة الموارد البشرية');
            const initials = getInitials(managerName);

            return {
                name: managerName,
                title: managerTitle,
                avatarUrl: null as string | null,
                initials: initials,
            };
        }
        if (employee) {
            return {
                name: employee.full_name,
                title: employee.job_title || (language === 'en' ? 'Wellbeing Member' : 'عضو العافية'),
                avatarUrl: employee.avatar_url,
                initials: getInitials(employee.full_name),
            };
        }
        return null;
    }, [employee, language, role]);

    return (
        <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            {/* Left: Menu + Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                    aria-label={t('menu')}
                >
                    <Menu className="w-5 h-5 text-[var(--text-primary)]" />
                </button>
                <div className="hidden md:block">
                    <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                        {t('appName')}
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {t('appTagline')}
                    </p>
                </div>
            </div>

            {/* Right: Language + Theme + Notifications */}
            <div className="flex items-center gap-2">
                {profile && (
                    <div className="hidden md:flex items-center gap-3 pr-4 mr-2 border-r border-[var(--border)]">
                        {profile.avatarUrl ? (
                            <Image
                                src={profile.avatarUrl}
                                alt={profile.name ? `${profile.name} avatar` : 'Profile avatar'}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white flex items-center justify-center font-semibold">
                                {profile.initials}
                            </div>
                        )}
                        <div className="text-left">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{profile.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{profile.title}</p>
                        </div>
                    </div>
                )}
                {/* Language Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors flex items-center gap-1"
                        title="Select Language"
                    >
                        <span className="text-lg">{language === 'en' ? '🇺🇸' : '🇸🇦'}</span>
                        <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
                    </button>

                    {/* Language Menu Dropdown */}
                    {showLanguageMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-20"
                                onClick={() => setShowLanguageMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-40 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-30 overflow-hidden">
                                <button
                                    onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors ${language === 'en' ? 'bg-[var(--muted)]' : ''
                                        }`}
                                >
                                    <span className="text-xl">🇺🇸</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">English</span>
                                </button>
                                <button
                                    onClick={() => { setLanguage('ar'); setShowLanguageMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors ${language === 'ar' ? 'bg-[var(--muted)]' : ''
                                        }`}
                                >
                                    <span className="text-xl">🇸🇦</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">العربية</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                    title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-[var(--text-primary)]" />
                    ) : (
                        <Moon className="w-5 h-5 text-[var(--text-primary)]" />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors relative"
                        title={t('notifications')}
                    >
                        <Bell className="w-5 h-5 text-[var(--text-primary)]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white text-[10px] font-bold rounded-full px-1 shadow-lg animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <NotificationsPanel
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </div>
            </div>
        </header>
    );
}

function getInitials(fullName?: string | null) {
    if (!fullName) {
        return 'MM';
    }
    return fullName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || 'MM';
}
