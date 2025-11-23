'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    confirmText?: string;
    confirmTextAr?: string;
    cancelText?: string;
    cancelTextAr?: string;
    variant?: 'danger' | 'warning' | 'info';
    language: 'en' | 'ar';
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    titleAr,
    message,
    messageAr,
    confirmText = 'Confirm',
    confirmTextAr = 'تأكيد',
    cancelText = 'Cancel',
    cancelTextAr = 'إلغاء',
    variant = 'warning',
    language
}: ConfirmModalProps) {
    const variants = {
        danger: {
            icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            border: 'border-red-200 dark:border-red-800'
        },
        warning: {
            icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            button: 'bg-orange-600 hover:bg-orange-700 text-white',
            border: 'border-orange-200 dark:border-orange-800'
        },
        info: {
            icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            border: 'border-blue-200 dark:border-blue-800'
        }
    };

    const currentVariant = variants[variant];

    const handleConfirm = () => {
        onConfirm();
        onClose();
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
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 ${currentVariant.border} overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative p-6 pb-4">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>

                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-full ${currentVariant.icon} flex items-center justify-center flex-shrink-0`}>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>

                                    {/* Title & Message */}
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            {language === 'en' ? title : titleAr}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {language === 'en' ? message : messageAr}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 p-6 pt-2 bg-gray-50 dark:bg-gray-900/50">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
                                >
                                    {language === 'en' ? cancelText : cancelTextAr}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium ${currentVariant.button} transition-all shadow-md hover:shadow-lg`}
                                >
                                    {language === 'en' ? confirmText : confirmTextAr}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
