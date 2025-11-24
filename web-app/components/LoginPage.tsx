'use client';

import Image from 'next/image';
import { Users, User, Building2, Heart, Brain, Sparkles, Shield, Activity, Lightbulb, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

type LoginPageProps = {
    onRoleSelect: (role: 'employee' | 'hr') => void;
};

export default function LoginPage({ onRoleSelect }: LoginPageProps) {
    const { language } = useApp();
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
                            <Image
                                src="/logo.jpg"
                                alt="MirrorMe Logo"
                                fill
                                className="object-cover"
                                sizes="64px"
                                priority
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

                {/* The Idea Section (Abstract) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12 max-w-3xl mx-auto text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-sm"
                >
                    <div className="flex items-center justify-center gap-2 mb-3 text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="font-semibold text-lg uppercase tracking-wider">
                            {language === 'en' ? 'The Concept' : 'الفكرة'}
                        </h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {language === 'en'
                            ? "MirrorMe creates a private 'Digital Twin' that evolves with you. It monitors your wellbeing patterns to prevent burnout before it happens, offering a safe space for reflection and proactive support."
                            : "يقوم MirrorMe بإنشاء 'توأم رقمي' خاص يتطور معك. يراقب أنماط صحتك النفسية لمنع الاحتراق الوظيفي قبل حدوثه، موفراً مساحة آمنة للتأمل والدعم الاستباقي."}
                    </p>
                </motion.div>

                {/* Role Selection Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
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

                {/* The Vision / Why Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <FeatureCard
                        icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
                        title={language === 'en' ? 'Why MirrorMe?' : 'لماذا MirrorMe؟'}
                        desc={language === 'en'
                            ? 'To bridge the gap between productivity and mental health, ensuring no employee feels unheard.'
                            : 'لسد الفجوة بين الإنتاجية والصحة النفسية، وضمان أن صوت كل موظف مسموع.'}
                    />
                    <FeatureCard
                        icon={<Brain className="w-8 h-8 text-blue-500" />}
                        title={language === 'en' ? 'Powered by IBM Watsonx' : 'مدعوم بـ IBM Watsonx'}
                        desc={language === 'en'
                            ? 'Leveraging enterprise-grade AI orchestration to provide accurate, secure, and actionable insights.'
                            : 'الاستفادة من تنسيق الذكاء الاصطناعي المؤسسي لتوفير رؤى دقيقة وآمنة وقابلة للتنفيذ.'}
                    />
                    <FeatureCard
                        icon={<Lightbulb className="w-8 h-8 text-amber-500" />}
                        title={language === 'en' ? 'Proactive Care' : 'رعاية استباقية'}
                        desc={language === 'en'
                            ? 'Moving from reactive support to proactive prevention by detecting early signs of stress.'
                            : 'الانتقال من الدعم التفاعلي إلى الوقاية الاستباقية من خلال الكشف عن علامات التوتر المبكرة.'}
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'en' ? 'Made by codk' : 'صنع بواسطة كودك'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-sm hover:shadow-md transition-all text-center">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                {icon}
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
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
