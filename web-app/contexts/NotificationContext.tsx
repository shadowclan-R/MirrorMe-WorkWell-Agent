'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, FileText, Settings, Users, TrendingUp } from 'lucide-react';

export type NotificationType = 'info' | 'warning' | 'success' | 'alert' | 'system';

export type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
    icon: ReactNode;
    category: 'wellbeing' | 'system' | 'hr' | 'achievement';
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children, role }: { children: ReactNode; role: 'employee' | 'hr' | null }) {
    // Use lazy initialization to avoid cascading renders
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        if (role === 'employee') {
            return [
                {
                    id: '1',
                    type: 'success',
                    title: 'Daily Check-in Completed',
                    titleAr: 'تم إكمال التسجيل اليومي',
                    message: 'Great job! Your wellbeing score today is 85%',
                    messageAr: 'عمل رائع! درجة رفاهيتك اليوم هي 85%',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
                    read: false,
                    icon: <CheckCircle className="w-5 h-5" />,
                    category: 'wellbeing'
                },
                {
                    id: '2',
                    type: 'info',
                    title: 'Digital Twin Insight',
                    titleAr: 'رؤية من التوأم الرقمي',
                    message: 'Your stress levels have been high this week. Consider taking a break.',
                    messageAr: 'مستويات التوتر لديك مرتفعة هذا الأسبوع. فكر في أخذ استراحة.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    read: false,
                    icon: <Info className="w-5 h-5" />,
                    category: 'wellbeing',
                    actionUrl: '/report'
                },
                {
                    id: '3',
                    type: 'warning',
                    title: 'Reminder: Evening Check-in',
                    titleAr: 'تذكير: التسجيل المسائي',
                    message: 'Don\'t forget to complete your evening wellbeing check-in',
                    messageAr: 'لا تنس إكمال تسجيل الرفاهية المسائي',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
                    read: true,
                    icon: <Bell className="w-5 h-5" />,
                    category: 'system'
                },
                {
                    id: '4',
                    type: 'success',
                    title: 'Slack Integration Connected',
                    titleAr: 'تم ربط Slack بنجاح',
                    message: 'Your Slack account has been successfully connected',
                    messageAr: 'تم ربط حساب Slack الخاص بك بنجاح',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    read: true,
                    icon: <CheckCircle className="w-5 h-5" />,
                    category: 'system',
                    actionUrl: '/integrations'
                }
            ];
        } else if (role === 'hr') {
            return [
                {
                    id: 'hr1',
                    type: 'alert',
                    title: 'High Risk Employee Alert',
                    titleAr: 'تنبيه موظف عالي الخطورة',
                    message: '3 employees showing signs of burnout. Immediate action recommended.',
                    messageAr: '3 موظفين يظهرون علامات الإرهاق. يُنصح باتخاذ إجراء فوري.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
                    read: false,
                    icon: <AlertTriangle className="w-5 h-5" />,
                    category: 'hr',
                    actionUrl: '/hr/alerts'
                },
                {
                    id: 'hr2',
                    type: 'warning',
                    title: 'Department Stress Level Rising',
                    titleAr: 'ارتفاع مستوى التوتر في القسم',
                    message: 'Engineering team average stress increased by 23% this week',
                    messageAr: 'زاد متوسط التوتر لفريق الهندسة بنسبة 23% هذا الأسبوع',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                    read: false,
                    icon: <TrendingUp className="w-5 h-5" />,
                    category: 'hr',
                    actionUrl: '/hr/analytics'
                },
                {
                    id: 'hr3',
                    type: 'info',
                    title: 'New Weekly Report Available',
                    titleAr: 'تقرير أسبوعي جديد متاح',
                    message: 'Company-wide wellbeing report for Week 47 is ready',
                    messageAr: 'تقرير الرفاهية على مستوى الشركة للأسبوع 47 جاهز',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
                    read: false,
                    icon: <FileText className="w-5 h-5" />,
                    category: 'hr',
                    actionUrl: '/hr/reports'
                },
                {
                    id: 'hr4',
                    type: 'success',
                    title: 'Employee Engagement Up',
                    titleAr: 'زيادة مشاركة الموظفين',
                    message: '87% of employees completed their daily check-ins this week',
                    messageAr: '87% من الموظفين أكملوا تسجيلاتهم اليومية هذا الأسبوع',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
                    read: true,
                    icon: <Users className="w-5 h-5" />,
                    category: 'hr'
                },
                {
                    id: 'hr5',
                    type: 'info',
                    title: 'System Update Completed',
                    titleAr: 'تم إكمال تحديث النظام',
                    message: 'MirrorMe platform has been updated to v2.1.0',
                    messageAr: 'تم تحديث منصة MirrorMe إلى الإصدار 2.1.0',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    read: true,
                    icon: <Settings className="w-5 h-5" />,
                    category: 'system'
                }
            ];
        }
        return [];
    });

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
