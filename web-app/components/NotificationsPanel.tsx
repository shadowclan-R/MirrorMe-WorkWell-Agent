'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCheck, Trash2, Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

type NotificationsPanelProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const { language } = useApp();
    const router = useRouter();

    const handleNotificationClick = (id: string, actionUrl?: string) => {
        markAsRead(id);
        if (actionUrl) {
            router.push(actionUrl);
            onClose();
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'alert':
                return 'from-red-500 to-rose-600';
            case 'warning':
                return 'from-orange-500 to-amber-600';
            case 'success':
                return 'from-green-500 to-emerald-600';
            case 'info':
                return 'from-blue-500 to-cyan-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return language === 'en' ? 'Just now' : 'الآن';
        if (diffMins < 60) return language === 'en' ? `${diffMins}m ago` : `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return language === 'en' ? `${diffHours}h ago` : `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return language === 'en' ? `${diffDays}d ago` : `منذ ${diffDays} يوم`;
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                        style={{ maxHeight: 'calc(100vh - 5rem)' }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] p-4 z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-[var(--primary)]" />
                                    <h3 className="font-bold text-lg text-[var(--text-primary)]">
                                        {language === 'en' ? 'Notifications' : 'الإشعارات'}
                                    </h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-[var(--primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                                </button>
                            </div>

                            {/* Actions */}
                            {notifications.length > 0 && (
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                            <span>{language === 'en' ? 'Mark all read' : 'قراءة الكل'}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={clearAll}
                                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{language === 'en' ? 'Clear all' : 'مسح الكل'}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-3">
                                        <BellOff className="w-8 h-8 text-[var(--text-secondary)]" />
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm text-center">
                                        {language === 'en'
                                            ? 'No notifications yet'
                                            : 'لا توجد إشعارات حتى الآن'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border)]">
                                    {notifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`p-4 hover:bg-[var(--muted)]/50 transition-colors cursor-pointer relative ${!notification.read ? 'bg-[var(--primary)]/5' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                                        >
                                            {/* Unread Indicator */}
                                            {!notification.read && (
                                                <div className="absolute top-4 right-4 w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                                            )}

                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${getTypeColor(notification.type)} rounded-lg flex items-center justify-center text-white shadow-md`}>
                                                    {notification.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-tight">
                                                            {language === 'en' ? notification.title : notification.titleAr}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">
                                                        {language === 'en' ? notification.message : notification.messageAr}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-[var(--text-secondary)] opacity-75">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification.id);
                                                                    }}
                                                                    className="p-1 hover:bg-[var(--primary)]/10 rounded transition-colors"
                                                                    title={language === 'en' ? 'Mark as read' : 'تعليم كمقروء'}
                                                                >
                                                                    <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                                                title={language === 'en' ? 'Delete' : 'حذف'}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
