'use client';

import { useState } from 'react';
import { Bell, Moon, Shield, Lock, Database, Download, Trash2, LogOut, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useRole } from '@/contexts/RoleContext';
import { useNotifications } from '@/contexts/NotificationContext';
import ConfirmModal from './ConfirmModal';

export default function SettingsView() {
    const { t, theme, language, toggleTheme, setLanguage } = useApp();
    const { logout, role } = useRole();
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
        setTimeout(() => logout(), 500); // Delay to show notification
    };

    const handleSettingChange = (settingName: string, newValue: string) => {
        addNotification({
            type: 'success',
            title: 'Settings Updated',
            titleAr: 'تم تحديث الإعدادات',
            message: `${settingName} has been changed to ${newValue}`,
            messageAr: `تم تغيير ${settingName} إلى ${newValue}`,
            icon: <Shield className="w-5 h-5" />,
            category: 'system'
        });
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-[var(--background)]">
            {/* Settings Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{t('settings')}</h1>
                        <p className="text-white/80 text-sm">
                            {language === 'en'
                                ? 'Manage your preferences and account settings'
                                : 'إدارة تفضيلاتك وإعدادات حسابك'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-[var(--primary)]" />
                    {language === 'en' ? 'Appearance' : 'المظهر'}
                </h3>

                <div className="space-y-4">
                    <SettingRow
                        label={language === 'en' ? 'Theme' : 'السمة'}
                        description={language === 'en' ? 'Choose your preferred color theme' : 'اختر سمة الألوان المفضلة'}
                        control={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (theme === 'dark') {
                                            toggleTheme();
                                            handleSettingChange('Theme', 'Light');
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                                        ? 'bg-[var(--primary)] text-white shadow-md'
                                        : 'bg-[var(--muted)] text-[var(--text-secondary)] hover:bg-[var(--muted)]/70'
                                        }`}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => {
                                        if (theme === 'light') {
                                            toggleTheme();
                                            handleSettingChange('Theme', 'Dark');
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark'
                                        ? 'bg-[var(--primary)] text-white shadow-md'
                                        : 'bg-[var(--muted)] text-[var(--text-secondary)] hover:bg-[var(--muted)]/70'
                                        }`}
                                >
                                    Dark
                                </button>
                            </div>
                        }
                    />

                    <SettingRow
                        label={language === 'en' ? 'Language' : 'اللغة'}
                        description={language === 'en' ? 'Select your preferred language' : 'اختر لغتك المفضلة'}
                        control={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setLanguage('en');
                                        handleSettingChange('Language', 'English');
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${language === 'en'
                                        ? 'bg-[var(--primary)] text-white shadow-md'
                                        : 'bg-[var(--muted)] text-[var(--text-secondary)] hover:bg-[var(--muted)]/70'
                                        }`}
                                >
                                    <span>🇺🇸</span>
                                    <span>English</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setLanguage('ar');
                                        handleSettingChange('Language', 'العربية');
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${language === 'ar'
                                        ? 'bg-[var(--primary)] text-white shadow-md'
                                        : 'bg-[var(--muted)] text-[var(--text-secondary)] hover:bg-[var(--muted)]/70'
                                        }`}
                                >
                                    <span>🇸🇦</span>
                                    <span>العربية</span>
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Notifications Settings */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--primary)]" />
                    {language === 'en' ? 'Notifications' : 'الإشعارات'}
                </h3>

                <div className="space-y-4">
                    <ToggleSetting
                        label={language === 'en' ? 'Check-in Reminders' : 'تذكيرات التسجيل'}
                        description={language === 'en' ? 'Get daily reminders for check-ins' : 'احصل على تذكيرات يومية للتسجيل'}
                        enabled={true}
                    />
                    <ToggleSetting
                        label={language === 'en' ? 'Wellbeing Alerts' : 'تنبيهات الصحة النفسية'}
                        description={language === 'en' ? 'Receive alerts for stress patterns' : 'احصل على تنبيهات حول أنماط الضغط'}
                        enabled={true}
                    />
                    <ToggleSetting
                        label={language === 'en' ? 'Weekly Reports' : 'التقارير الأسبوعية'}
                        description={language === 'en' ? 'Email weekly wellbeing summary' : 'إرسال ملخص أسبوعي عبر البريد'}
                        enabled={false}
                    />
                    <ToggleSetting
                        label={language === 'en' ? 'Achievement Notifications' : 'إشعارات الإنجازات'}
                        description={language === 'en' ? 'Get notified about milestones' : 'احصل على إشعارات حول الإنجازات'}
                        enabled={true}
                    />
                </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[var(--primary)]" />
                    {language === 'en' ? 'Privacy & Security' : 'الخصوصية والأمان'}
                </h3>

                <div className="space-y-4">
                    <ToggleSetting
                        label={language === 'en' ? 'Data Sharing' : 'مشاركة البيانات'}
                        description={language === 'en' ? 'Share anonymized data for research' : 'مشاركة بيانات مجهولة للبحث'}
                        enabled={false}
                    />
                    <ToggleSetting
                        label={language === 'en' ? 'Manager Visibility' : 'رؤية المدير'}
                        description={language === 'en' ? 'Allow manager to view aggregated insights' : 'السماح للمدير برؤية الرؤى المجمعة'}
                        enabled={true}
                    />
                    <ToggleSetting
                        label={language === 'en' ? 'Two-Factor Authentication' : 'المصادقة الثنائية'}
                        description={language === 'en' ? 'Add an extra layer of security' : 'إضافة طبقة إضافية من الأمان'}
                        enabled={false}
                    />
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[var(--primary)]" />
                    {language === 'en' ? 'Data Management' : 'إدارة البيانات'}
                </h3>

                <div className="space-y-3">
                    <ActionButton
                        icon={<Download className="w-4 h-4" />}
                        label={language === 'en' ? 'Export My Data' : 'تصدير بياناتي'}
                        description={language === 'en' ? 'Download all your check-ins and insights' : 'تنزيل جميع تسجيلاتك ورؤاك'}
                        variant="primary"
                    />
                    <ActionButton
                        icon={<Trash2 className="w-4 h-4" />}
                        label={language === 'en' ? 'Delete Account' : 'حذف الحساب'}
                        description={language === 'en' ? 'Permanently delete your account and data' : 'حذف حسابك وبياناتك نهائياً'}
                        variant="danger"
                    />
                </div>
            </div>

            {/* Account Management */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--primary)]" />
                    {language === 'en' ? 'Account Management' : 'إدارة الحساب'}
                </h3>

                <div className="space-y-3">
                    <div className="p-4 bg-[var(--muted)] rounded-lg">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">
                            {language === 'en' ? 'Current Role' : 'الدور الحالي'}
                        </p>
                        <p className="font-semibold text-[var(--text-primary)]">
                            {role === 'hr'
                                ? (language === 'en' ? 'HR Manager' : 'مدير الموارد البشرية')
                                : (language === 'en' ? 'Employee' : 'موظف')}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20"
                    >
                        <div className="w-10 h-10 bg-current/10 rounded-lg flex items-center justify-center">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium">{language === 'en' ? 'Logout' : 'تسجيل الخروج'}</p>
                            <p className="text-xs opacity-75 mt-1">
                                {language === 'en' ? 'Sign out of your account' : 'تسجيل الخروج من حسابك'}
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                titleAr="تأكيد تسجيل الخروج"
                message="Are you sure you want to logout? You will need to sign in again to access your account."
                messageAr="هل أنت متأكد من تسجيل الخروج؟ ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك."
                confirmText="Yes, Logout"
                confirmTextAr="نعم، تسجيل الخروج"
                cancelText="Cancel"
                cancelTextAr="إلغاء"
                variant="warning"
                language={language}
            />
        </div>
    );
}

function SettingRow({
    label,
    description,
    control,
}: {
    label: string;
    description: string;
    control: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
            </div>
            <div className="ml-4">{control}</div>
        </div>
    );
}

function ToggleSetting({
    label,
    description,
    enabled,
}: {
    label: string;
    description: string;
    enabled: boolean;
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
            </div>
            <button
                className={`relative w-12 h-6 rounded-full transition-all ${enabled ? 'bg-[var(--accent)]' : 'bg-gray-300'
                    }`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
}

function ActionButton({
    icon,
    label,
    description,
    variant,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    variant: 'primary' | 'danger';
}) {
    const styles = {
        primary: 'bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 border-[var(--primary)]/20',
        danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20',
    };

    return (
        <button className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${styles[variant]}`}>
            <div className="w-10 h-10 bg-current/10 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1 text-left">
                <p className="font-medium">{label}</p>
                <p className="text-xs opacity-75 mt-1">{description}</p>
            </div>
        </button>
    );
}
