'use client';

import { Users, User, Building2, Heart, Brain, Sparkles, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

type LoginPageProps = {
    onRoleSelect: (role: 'employee' | 'hr') => void;
};

export default function LoginPage({ onRoleSelect }: LoginPageProps) {
    const [hoveredCard, setHoveredCard] = useState<'employee' | 'hr' | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-6">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="/logo.jpg"
                                alt="MirrorMe Logo"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            MirrorMe WorkWell
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                        Your Digital Twin for Workplace Wellbeing
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        توأمك الرقمي للصحة النفسية في العمل
                    </p>
                </motion.div>

                {/* Role Selection Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Employee Card */}
                    <RoleCard
                        title="Employee Portal"
                        titleAr="بوابة الموظف"
                        description="Access your personal wellbeing dashboard, daily check-ins, and AI-powered insights"
                        descriptionAr="الوصول إلى لوحة التحكم الشخصية، التسجيلات اليومية، والرؤى الذكية"
                        icon={<User className="w-16 h-16" />}
                        features={[
                            { icon: <Heart className="w-5 h-5" />, text: 'Daily Check-ins', textAr: 'تسجيلات يومية' },
                            { icon: <Brain className="w-5 h-5" />, text: 'AI Insights', textAr: 'رؤى ذكية' },
                            { icon: <Activity className="w-5 h-5" />, text: 'Wellbeing Analytics', textAr: 'تحليلات الصحة' },
                            { icon: <Shield className="w-5 h-5" />, text: 'Privacy Protected', textAr: 'خصوصية محمية' },
                        ]}
                        gradient="from-blue-500 via-cyan-500 to-teal-500"
                        hoverGradient="from-blue-600 via-cyan-600 to-teal-600"
                        isHovered={hoveredCard === 'employee'}
                        onHover={() => setHoveredCard('employee')}
                        onLeave={() => setHoveredCard(null)}
                        onClick={() => onRoleSelect('employee')}
                    />

                    {/* HR Manager Card */}
                    <RoleCard
                        title="HR Manager Portal"
                        titleAr="بوابة مدير الموارد البشرية"
                        description="Manage employee wellbeing, view analytics, and access comprehensive reports"
                        descriptionAr="إدارة صحة الموظفين، عرض التحليلات، والوصول للتقارير الشاملة"
                        icon={<Users className="w-16 h-16" />}
                        features={[
                            { icon: <Building2 className="w-5 h-5" />, text: 'Team Overview', textAr: 'نظرة عامة' },
                            { icon: <Activity className="w-5 h-5" />, text: 'Advanced Analytics', textAr: 'تحليلات متقدمة' },
                            { icon: <Shield className="w-5 h-5" />, text: 'Risk Management', textAr: 'إدارة المخاطر' },
                            { icon: <Sparkles className="w-5 h-5" />, text: 'AI Recommendations', textAr: 'توصيات ذكية' },
                        ]}
                        gradient="from-purple-500 via-pink-500 to-rose-500"
                        hoverGradient="from-purple-600 via-pink-600 to-rose-600"
                        isHovered={hoveredCard === 'hr'}
                        onHover={() => setHoveredCard('hr')}
                        onLeave={() => setHoveredCard(null)}
                        onClick={() => onRoleSelect('hr')}
                    />
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Made by codk</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">صنع بواسطة كودك</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

type RoleCardProps = {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: React.ReactNode;
    features: Array<{ icon: React.ReactNode; text: string; textAr: string }>;
    gradient: string;
    hoverGradient: string;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
};

function RoleCard({
    title,
    titleAr,
    description,
    descriptionAr,
    icon,
    features,
    gradient,
    hoverGradient,
    isHovered,
    onHover,
    onLeave,
    onClick,
}: RoleCardProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={onHover}
            onHoverEnd={onLeave}
            onClick={onClick}
            className="relative group text-left"
        >
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-3xl">
                {/* Gradient Header */}
                <div
                    className={`bg-gradient-to-r ${isHovered ? hoverGradient : gradient
                        } p-8 text-white transition-all duration-300`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-1">{title}</h2>
                            <p className="text-lg opacity-90">{titleAr}</p>
                        </div>
                    </div>
                    <p className="text-white/90 mb-2">{description}</p>
                    <p className="text-sm text-white/75">{descriptionAr}</p>
                </div>

                {/* Features List */}
                <div className="p-8 space-y-4">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <div
                                className={`p-2 bg-gradient-to-r ${gradient} rounded-lg text-white`}
                            >
                                {feature.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {feature.text}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {feature.textAr}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Enter Button */}
                <div className="px-8 pb-8">
                    <div
                        className={`w-full bg-gradient-to-r ${gradient} text-white py-4 rounded-xl font-semibold text-center shadow-lg transition-all duration-300 group-hover:shadow-2xl`}
                    >
                        Enter Portal • ادخل الآن
                    </div>
                </div>

                {/* Hover Effect Border */}
                <div
                    className={`absolute inset-0 rounded-3xl border-2 ${isHovered ? 'border-purple-500' : 'border-transparent'
                        } transition-all duration-300 pointer-events-none`}
                />
            </div>
        </motion.button>
    );
}
