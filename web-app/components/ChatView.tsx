'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, Heart, Brain, Mic, StopCircle, Volume2, Type, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmployeeProfile } from '@/contexts/EmployeeDataContext';
import { supabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import { sendChatMessageService } from '@/lib/client-services';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
};

export default function ChatView() {
    const { t, language } = useApp();
    const {
        employee,
        chatHistory,
        chatLoading,
        chatError,
        refreshChatHistory,
    } = useEmployeeProfile();
    const employeeId = employee?.id;
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasLocalConversation, setHasLocalConversation] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedMood, setSelectedMood] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Voice Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showVoiceOptions, setShowVoiceOptions] = useState(false);
    const [savedAudioBlob, setSavedAudioBlob] = useState<Blob | null>(null);
    const [savedTranscript, setSavedTranscript] = useState('');
    const [isClearingChat, setIsClearingChat] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const defaultAssistantMessage = useMemo<Message>(() => ({
        role: 'assistant',
        content: language === 'en'
            ? "Hi! I'm your MirrorMe digital twin 👋\n\nI'm here to understand how you're feeling and support your wellbeing journey. How are you feeling today?"
            : 'مرحباً! أنا توأمك الرقمي MirrorMe 👋\n\nأنا هنا لأفهم مشاعرك وأدعم رحلتك نحو الصحة النفسية. كيف حالك اليوم؟',
        timestamp: 'Now',
    }), [language]);

    useEffect(() => {
        if (chatLoading) {
            return;
        }

        if (!employeeId) {
            if (hasLocalConversation) {
                setHasLocalConversation(false);
            }
            setMessages([defaultAssistantMessage]);
            return;
        }

        if (chatHistory.length > 0) {
            const normalized = chatHistory.map((entry) => ({
                role: entry.role,
                content: entry.content ?? '',
                timestamp: formatMessageTimestamp(entry.timestamp),
            }));
            setHasLocalConversation(true);
            setMessages(normalized);
            return;
        }

        if (!hasLocalConversation) {
            setMessages([defaultAssistantMessage]);
        }
    }, [chatHistory, chatLoading, defaultAssistantMessage, employeeId, hasLocalConversation]);

    const moodOptions = [
        { emoji: '😊', label: 'Great', labelAr: 'ممتاز', value: 'great', color: 'from-[var(--accent)] to-emerald-400' },
        { emoji: '🙂', label: 'Good', labelAr: 'جيد', value: 'good', color: 'from-[var(--primary)] to-sky-400' },
        { emoji: '😐', label: 'Okay', labelAr: 'عادي', value: 'okay', color: 'from-yellow-400 to-amber-400' },
        { emoji: '😟', label: 'Not Great', labelAr: 'ليس جيداً', value: 'bad', color: 'from-orange-400 to-red-400' },
        { emoji: '😢', label: 'Struggling', labelAr: 'صعب', value: 'struggling', color: 'from-red-400 to-rose-500' },
    ];

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        }
                    }
                    if (finalTranscript) {
                        // حفظ النص المُحوّل في savedTranscript بدلاً من inputText
                        setSavedTranscript(prev => prev + finalTranscript);
                    }
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.onend = () => {
                    // Recognition ended
                };

                recognitionRef.current = recognition;
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language]);

    // Clear chat history when component unmounts (user leaves chat)
    useEffect(() => {
        return () => {
            // Cleanup function that runs when component unmounts
            if (employeeId && messages.length > 1) {
                // Only clear if there are actual messages beyond the welcome message
                void (async () => {
                    try {
                        await supabaseBrowserClient
                            .from('chat_logs')
                            .delete()
                            .eq('employee_id', employeeId);
                        console.log('Chat history cleared on unmount');
                    } catch (error) {
                        console.error('Error clearing chat on unmount:', error);
                    }
                })();
            }
        };
    }, [employeeId, messages.length]);

    // Cleanup recording interval on unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);

    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Start MediaRecorder for audio recording
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setSavedTranscript(''); // مسح النص السابق

            // Start Speech Recognition for live transcription
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }

            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert(language === 'en'
                ? 'Could not access microphone. Please check permissions.'
                : 'لا يمكن الوصول للمايكروفون. يرجى التحقق من الأذونات.');
        }
    };

    const stopVoiceRecording = () => {
        // Stop Speech Recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        // Stop MediaRecorder and save audio blob
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setSavedAudioBlob(audioBlob);
                setShowVoiceOptions(true);
            };

            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        // Stop timer
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }

        setIsRecording(false);
        setRecordingTime(0);
    };

    const toggleVoiceRecording = () => {
        if (isRecording) {
            stopVoiceRecording();
        } else {
            startVoiceRecording();
        }
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMessageTimestamp = (value?: string | null) => {
        if (!value) {
            return 'Just now';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'Just now';
        }
        return date.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
    };

    const clearChatHistory = async () => {
        if (!employeeId) {
            alert(language === 'en'
                ? 'Unable to clear chat. Please try again.'
                : 'لا يمكن مسح المحادثات. حاول مرة أخرى.');
            return;
        }

        const confirmMessage = language === 'en'
            ? 'Are you sure you want to clear all chat messages? This action cannot be undone.'
            : 'هل أنت متأكد من حذف جميع المحادثات؟ لا يمكن التراجع عن هذا الإجراء.';

        if (!confirm(confirmMessage)) {
            return;
        }

        setIsClearingChat(true);
        try {
            const { error } = await supabaseBrowserClient
                .from('chat_logs')
                .delete()
                .eq('employee_id', employeeId);

            if (error) throw error;

            // Reset local state
            setMessages([defaultAssistantMessage]);
            setHasLocalConversation(false);
            refreshChatHistory();

            alert(language === 'en'
                ? '✅ Chat history cleared successfully!'
                : '✅ تم مسح المحادثات بنجاح!');
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert(language === 'en'
                ? '❌ Failed to clear chat history. Please try again.'
                : '❌ فشل مسح المحادثات. حاول مرة أخرى.');
        } finally {
            setIsClearingChat(false);
        }
    };

    const handleSendAsVoice = () => {
        if (!savedAudioBlob) return;

        // Here you would typically upload the audio to your backend
        // For now, we'll simulate sending it
        const userMessage: Message = {
            role: 'user',
            content: `🎤 ${language === 'en' ? 'Voice message sent' : 'تم إرسال رسالة صوتية'}`,
            timestamp: 'Just now'
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setHasLocalConversation(true);
        setShowVoiceOptions(false);
        setSavedAudioBlob(null);
        setIsProcessing(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                role: 'assistant',
                content: language === 'en'
                    ? 'I received your voice message. Let me analyze it... Based on your tone and words, I can sense your emotions.'
                    : 'استلمت رسالتك الصوتية. دعني أحللها... بناءً على نبرة صوتك وكلماتك، أستطيع أن أشعر بمشاعرك.',
                timestamp: 'Just now'
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsProcessing(false);
        }, 2000);
    };

    const handleConvertToText = () => {
        setShowVoiceOptions(false);

        // استخدام النص المحفوظ من التسجيل المباشر
        if (savedTranscript.trim()) {
            setInputText(savedTranscript.trim());
        } else {
            // في حالة فشل التحويل التلقائي
            setInputText(language === 'en'
                ? '(No speech detected - please type your message)'
                : '(لم يتم اكتشاف كلام - الرجاء كتابة رسالتك)');
        }

        // تنظيف البيانات المحفوظة
        setSavedAudioBlob(null);
        setSavedTranscript('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isProcessing) return;
        if (!employeeId) {
            alert(language === 'en'
                ? 'Employee profile is still loading. Please try again shortly.'
                : 'ما زلنا نقوم بتحميل ملف الموظف. حاول مرة أخرى بعد قليل.');
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: inputText,
            timestamp: 'Just now'
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setHasLocalConversation(true);
        setInputText('');
        setIsProcessing(true);

        try {
            // Call Client Service (replaces /api/chat)
            const data = await sendChatMessageService(
                userMessage.content,
                updatedMessages.map(m => ({ role: m.role, content: m.content })),
                employeeId,
                language
            );

            const aiResponse: Message = {
                role: 'assistant',
                content: data.response || (language === 'en' ? 'I am processing your request...' : 'جاري معالجة طلبك...'),
                timestamp: 'Just now'
            };
            setMessages(prev => [...prev, aiResponse]);
            refreshChatHistory();
        } catch (error) {
            console.error('Chat error:', error);
            // Fallback simulation if API fails (for demo purposes)
            setTimeout(() => {
                const aiResponse: Message = {
                    role: 'assistant',
                    content: language === 'en'
                        ? `(Offline Mode) Thank you for sharing. I can sense that you're feeling ${selectedMood || 'reflective'} today.`
                        : `(الوضع غير المتصل) شكراً لمشاركتك. أستشعر أنك تشعر بـ${selectedMood || 'تأمل'} اليوم.`,
                    timestamp: 'Just now'
                };
                setMessages(prev => [...prev, aiResponse]);
            }, 1000);
        } finally {
            setIsProcessing(false);
            setSelectedMood('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--background)]">
            {/* Modern Chat Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] p-6 shadow-lg">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{t('chatTitle')}</h2>
                            <p className="text-white/80 text-sm">محادثة التسجيل اليومي</p>
                        </div>
                    </div>
                    <button
                        onClick={clearChatHistory}
                        disabled={isClearingChat || isProcessing || messages.length <= 1}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={language === 'en' ? 'Clear all messages' : 'مسح جميع المحادثات'}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'en' ? 'Clear Chat' : 'مسح المحادثات'}</span>
                    </button>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-xs">
                    {isRecording ? (
                        <>
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <span className="text-red-100 font-medium">
                                {language === 'en' ? 'Recording...' : 'جاري التسجيل...'}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Your digital twin is listening...</span>
                        </>
                    )}
                </div>
            </div>

            {/* Messages Area with Beautiful Bubbles */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatError && (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
                        {language === 'en'
                            ? 'Unable to load your previous conversations right now. You can still keep chatting and we will sync shortly.'
                            : 'لا يمكن تحميل محادثاتك السابقة حالياً، لكن يمكنك المتابعة وسنقوم بالمزامنة لاحقاً.'}
                    </div>
                )}
                {/* Voice Recording Banner */}
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg mb-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Mic className="w-6 h-6 animate-pulse" />
                                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">
                                    {language === 'en' ? '🎙️ Voice Recording Active' : '🎙️ التسجيل الصوتي نشط'}
                                </p>
                                <p className="text-sm text-white/90">
                                    {language === 'en'
                                        ? 'Speak naturally - your words are being transcribed...'
                                        : 'تحدث بطبيعية - يتم تحويل كلماتك إلى نص...'}
                                </p>
                            </div>
                            <div className="text-2xl font-mono bg-white/20 px-3 py-1 rounded-lg">
                                {formatRecordingTime(recordingTime)}
                            </div>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="flex items-start gap-3 max-w-[80%]">
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div>
                                    <div
                                        className={`p-4 rounded-2xl shadow-md ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white rounded-br-sm'
                                            : 'bg-[var(--card)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border)]'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1 px-2">{msg.timestamp}</p>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Heart className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl rounded-bl-sm shadow-md">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modern Input Area */}
            <div className="bg-[var(--card)] border-t border-[var(--border)] p-6 shadow-2xl">
                {/* Quick Mood Selector */}
                <div className="mb-4">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                        {language === 'en' ? 'Quick Mood Check' : 'حالتك المزاجية السريعة'}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {moodOptions.map((mood) => (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${selectedMood === mood.value
                                    ? `bg-gradient-to-br ${mood.color} text-white shadow-lg scale-105`
                                    : 'bg-[var(--muted)] hover:bg-[var(--muted)]/70 text-[var(--text-secondary)]'
                                    }`}
                            >
                                <span className="text-2xl">{mood.emoji}</span>
                                <span className="text-[10px] font-medium whitespace-nowrap">
                                    {language === 'en' ? mood.label : mood.labelAr}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Text Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={language === 'en' ? "Share what's on your mind..." : "شارك ما يدور في ذهنك..."}
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-all"
                            disabled={isProcessing || isRecording}
                        />
                        {isRecording && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <span className="text-xs font-mono text-red-500">{formatRecordingTime(recordingTime)}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={toggleVoiceRecording}
                        disabled={isProcessing}
                        className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-lg'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={isRecording
                            ? (language === 'en' ? 'Stop Recording' : 'إيقاف التسجيل')
                            : (language === 'en' ? 'Start Voice Recording' : 'بدء التسجيل الصوتي')}
                    >
                        {isRecording ? (
                            <>
                                <StopCircle className="w-5 h-5" />
                                <span className="hidden sm:inline">{language === 'en' ? 'Stop' : 'إيقاف'}</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                <span className="hidden sm:inline">{language === 'en' ? 'Voice' : 'صوت'}</span>
                            </>
                        )}
                    </button>

                    <button
                        type="submit"
                        disabled={!inputText.trim() || isProcessing || isRecording}
                        className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'en' ? 'Send' : 'إرسال'}</span>
                    </button>
                </form>
            </div>

            {/* Voice Options Modal */}
            <AnimatePresence>
                {showVoiceOptions && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVoiceOptions(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
                        >
                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
                                        <Mic className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                            {language === 'en' ? 'Voice Recording Ready' : 'التسجيل الصوتي جاهز'}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {language === 'en' ? 'How would you like to send?' : 'كيف تريد الإرسال؟'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Send as Voice Button */}
                                    <button
                                        onClick={handleSendAsVoice}
                                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-xl hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                <Volume2 className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">
                                                    {language === 'en' ? 'Send as Voice' : 'إرسال كصوت'}
                                                </div>
                                                <div className="text-xs opacity-90">
                                                    {language === 'en' ? 'AI analyzes your voice directly' : 'الذكاء الاصطناعي يحلل صوتك مباشرة'}
                                                </div>
                                            </div>
                                        </div>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {/* Convert to Text Button */}
                                    <button
                                        onClick={handleConvertToText}
                                        className="w-full flex items-center justify-between p-4 bg-[var(--muted)] hover:bg-[var(--muted)]/70 text-[var(--text-primary)] rounded-xl border border-[var(--border)] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                                                <Type className="w-5 h-5 text-[var(--primary)]" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">
                                                    {language === 'en' ? 'Convert to Text' : 'تحويل لنص'}
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)]">
                                                    {language === 'en' ? 'Review and edit before sending' : 'مراجعة وتعديل قبل الإرسال'}
                                                </div>
                                            </div>
                                        </div>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {/* Cancel Button */}
                                    <button
                                        onClick={() => {
                                            setShowVoiceOptions(false);
                                            setSavedAudioBlob(null);
                                        }}
                                        className="w-full p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
                                    >
                                        {language === 'en' ? 'Cancel' : 'إلغاء'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
