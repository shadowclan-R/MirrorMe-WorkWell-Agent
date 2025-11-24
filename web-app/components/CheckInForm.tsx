'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Activity, Heart, AlertCircle } from 'lucide-react';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';
import { analyzeSentimentService, submitCheckInService } from '@/lib/client-services';

type CheckInResponse = {
    status: 'success' | 'error';
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation?: string;
    error?: string;
};

export default function CheckInForm() {
    const [mood, setMood] = useState(3);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<CheckInResponse | null>(null);

    const { employee: employeeData, loading, refreshEmployee, refreshChatHistory } = useEmployeeProfile();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeData?.id) {
            alert('Employee ID not found. Please wait for data to load.');
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Analyze Sentiment
            const sentimentResult = await analyzeSentimentService(text);

            // 2. Submit Check-in
            const checkInResult = await submitCheckInService(
                employeeData.id,
                mood,
                sentimentResult,
                text
            );

            setResult(checkInResult);
            refreshEmployee();
            refreshChatHistory();

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">Loading employee data...</div>;
    }

    if (!employeeData) {
        return <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">Unable to load your profile. Please refresh and try again.</div>;
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Daily Check-in</h2>
                <p className="text-center text-gray-500 mb-8">How are you feeling today?</p>

                {!result ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mood Score: {mood}/5</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={mood}
                                onChange={(e) => setMood(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Stressed</span>
                                <span>Balanced</span>
                                <span>Great</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">What&apos;s on your mind?</label>
                            <div className="relative">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                                    placeholder="I&apos;m feeling..."
                                />
                                <button
                                    type="button"
                                    className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Record Voice (Demo)"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                'Analyzing...'
                            ) : (
                                <>
                                    <span>Submit Check-in</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className={`inline-flex p-4 rounded-full mb-4 ${result.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                            {result.riskLevel === 'HIGH' ? <AlertCircle className="w-8 h-8" /> : <Heart className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {result.riskLevel === 'HIGH' ? 'We are here for you' : 'Great to hear!'}
                        </h3>
                        <p className="text-gray-600 mb-6">{result.recommendation}</p>
                        <button
                            onClick={() => { setResult(null); setText(''); setMood(3); }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Submit another check-in
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
