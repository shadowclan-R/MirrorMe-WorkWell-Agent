'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ar';

type AppContextType = {
    theme: Theme;
    language: Language;
    toggleTheme: () => void;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
    en: {
        appName: 'MirrorMe WorkWell',
        appTagline: 'Your Digital Twin for Workplace Wellbeing',
        newCheckin: 'New Check-in',
        dashboard: 'Dashboard',
        menu: 'Menu',
        history: 'History',
        welcome: 'Welcome back',
        mood: 'Your Mood Today',
        checkins: 'Check-ins This Week',
        stress: 'Stress Level',
        energy: 'Energy Score',
        twinStatus: 'Your Digital Twin Status',
        recentInsights: 'Recent Insights',
        startCheckin: 'Start a Check-in',
        viewReport: 'Digital Twin Status',
        notifications: 'Notifications',
        settings: 'Settings',
        chatTitle: 'Daily Check-in Chat',
        chatWelcome: "Hi! I'm your MirrorMe digital twin. How are you feeling today? 👋",
        profile: 'Profile',
        connectedChannels: 'Connected Channels',
        appearance: 'Appearance',
        privacy: 'Privacy & Security',
        dataManagement: 'Data Management',
        exportData: 'Export My Data',
        deleteAccount: 'Delete Account',
    },
    ar: {
        appName: 'MirrorMe WorkWell',
        appTagline: 'توأمك الرقمي للصحة النفسية في العمل',
        newCheckin: 'تسجيل جديد',
        dashboard: 'الرئيسية',
        menu: 'القائمة',
        history: 'السجل',
        welcome: 'أهلاً بعودتك',
        mood: 'مزاجك اليوم',
        checkins: 'تسجيلاتك هذا الأسبوع',
        stress: 'مستوى الضغط',
        energy: 'مستوى الطاقة',
        twinStatus: 'حالة توأمك الرقمي',
        recentInsights: 'رؤى حديثة',
        startCheckin: 'ابدأ تسجيل يومي',
        viewReport: 'حالة توأمك الرقمي',
        notifications: 'الإشعارات',
        settings: 'الإعدادات',
        chatTitle: 'محادثة التسجيل اليومي',
        chatWelcome: 'مرحبًا! أنا توأمك الرقمي MirrorMe. كيف حالك اليوم؟ 👋',
        profile: 'الملف الشخصي',
        connectedChannels: 'القنوات المتصلة',
        appearance: 'المظهر',
        privacy: 'الخصوصية والأمان',
        dataManagement: 'إدارة البيانات',
        exportData: 'تصدير بياناتي',
        deleteAccount: 'حذف الحساب',
    },
};

export function AppProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') as Theme | null;
            return saved || 'light';
        }
        return 'light';
    });

    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('language') as Language | null;
            return saved || 'en';
        }
        return 'en';
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Save language preference
    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.setAttribute('lang', language);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    }, [language]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
    };

    const setLanguageDirectly = (lang: Language) => {
        setLanguage(lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <AppContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, setLanguage: setLanguageDirectly, t }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
