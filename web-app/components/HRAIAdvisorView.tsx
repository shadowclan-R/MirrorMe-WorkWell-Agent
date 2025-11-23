'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Brain,
    Send,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    Loader2,
    CheckCircle,
    Clock,
    Mic,
    FileAudio,
    StopCircle,
    Type
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type PriorityLevel = 'critical' | 'high' | 'medium' | 'normal';
type SuggestionStatus = 'new' | 'in-progress' | 'completed' | 'dismissed';

type SpeechRecognitionAlternativeLike = {
    transcript: string;
};

type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike>;

type SpeechRecognitionResultListLike = ArrayLike<SpeechRecognitionResultLike>;

interface SpeechRecognitionResultEventLike {
    results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
    error: string;
}

interface SpeechRecognitionInstance {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type ExtendedSpeechRecognitionWindow = Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    audioUrl?: string;
    mediaType: 'text' | 'audio';
    timestamp: Date;
};

type Suggestion = {
    id: string;
    type: 'vacation' | 'event' | 'wellness' | 'recognition' | 'intervention' | 'retention';
    employee: string;
    priority: PriorityLevel;
    icon: string;
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    status: SuggestionStatus;
};

const mockSuggestions: Suggestion[] = [
    {
        id: '1',
        type: 'vacation',
        employee: 'Sara Al-Fahad',
        priority: 'critical',
        icon: '🏖️',
        title: 'Urgent: Time Off Recommended',
        titleAr: 'عاجل: إجازة موصى بها',
        message: 'Sara has shown high stress for 3 consecutive weeks. Recommend 5-7 days vacation to prevent burnout.',
        messageAr: 'سارة أظهرت ضغطاً عالياً لمدة 3 أسابيع متتالية. يُوصى بإجازة 5-7 أيام لمنع الاحتراق الوظيفي.',
        status: 'new'
    },
    {
        id: '2',
        type: 'event',
        employee: 'Engineering Team',
        priority: 'high',
        icon: '🎯',
        title: 'Team Decompression Event',
        titleAr: 'فعالية تخفيف الضغط',
        message: 'After 2 months of intensive project work, organize a team building event this weekend to boost morale.',
        messageAr: 'بعد شهرين من العمل المكثف على المشروع، نظّم فعالية بناء فريق نهاية الأسبوع لرفع المعنويات.',
        status: 'new'
    },
    {
        id: '3',
        type: 'wellness',
        employee: 'Sales Department',
        priority: 'medium',
        icon: '🧘',
        title: 'Wellness Workshop Suggested',
        titleAr: 'ورشة عمل للصحة النفسية',
        message: 'Sales team stress levels increasing. Schedule a stress management workshop next week.',
        messageAr: 'مستويات الضغط في فريق المبيعات ترتفع. جدول ورشة عمل لإدارة الضغط الأسبوع القادم.',
        status: 'in-progress'
    },
    {
        id: '4',
        type: 'recognition',
        employee: 'Mohammed Al-Rashid',
        priority: 'normal',
        icon: '⭐',
        title: 'Recognition Opportunity',
        titleAr: 'فرصة للتقدير',
        message: 'Mohammed maintains excellent wellbeing score. Public recognition will reinforce positive behavior.',
        messageAr: 'محمد يحافظ على درجة صحة ممتازة. التقدير العلني سيعزز السلوك الإيجابي.',
        status: 'new'
    },
    {
        id: '5',
        type: 'intervention',
        employee: 'Multiple High-Risk',
        priority: 'critical',
        icon: '🚨',
        title: 'Burnout Prevention Required',
        titleAr: 'الوقاية من الاحتراق الوظيفي',
        message: '8 employees showing burnout symptoms. Immediate intervention: reduce workload, offer flexible hours.',
        messageAr: '8 موظفين يظهرون أعراض احتراق وظيفي. تدخل فوري: تقليل العبء، توفير ساعات مرنة.',
        status: 'new'
    },
    {
        id: '6',
        type: 'retention',
        employee: 'HR Department',
        priority: 'high',
        icon: '🎯',
        title: 'Retention Strategy Alert',
        titleAr: 'تنبيه استراتيجية الاحتفاظ',
        message: 'HR team loyalty score dipping. Consider career development opportunities and performance bonuses.',
        messageAr: 'درجة ولاء فريق الموارد البشرية تنخفض. فكر في فرص التطور الوظيفي ومكافآت الأداء.',
        status: 'new'
    }
];

export default function HRAIAdvisorView() {
    const { language } = useApp();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: language === 'en'
                ? 'Hello! I\'m your AI Wellbeing Advisor. I analyze employee data, trends, and patterns to provide actionable insights. How can I help you today?'
                : 'مرحباً! أنا المستشار الذكي للصحة النفسية. أحلل بيانات الموظفين، الاتجاهات، والأنماط لتقديم رؤى قابلة للتنفيذ. كيف يمكنني مساعدتك اليوم؟',
            mediaType: 'text',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
    const [isRecording, setIsRecording] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const [composeMode, setComposeMode] = useState<'text' | 'voice'>('text');
    const [isVoiceNoteRecording, setIsVoiceNoteRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const voiceNoteUrlRef = useRef<string | null>(null);
    const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);
    const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
    const [voiceNoteError, setVoiceNoteError] = useState<string | null>(null);
    const isVoiceSupportAvailable = useMemo(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        const mediaDevices = window.navigator?.mediaDevices;
        return Boolean(mediaDevices && typeof mediaDevices.getUserMedia === 'function');
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (voiceNoteUrlRef.current) {
                URL.revokeObjectURL(voiceNoteUrlRef.current);
            }
        };
    }, []);

    const clearVoiceNotePreview = () => {
        if (voiceNoteUrlRef.current) {
            URL.revokeObjectURL(voiceNoteUrlRef.current);
            voiceNoteUrlRef.current = null;
        }
        setVoiceNoteUrl(null);
        setVoiceNoteBlob(null);
    };

    const startVoiceNoteRecording = async () => {
        if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
            setVoiceNoteError(language === 'en'
                ? 'Voice note recording is not supported in this browser.'
                : 'تسجيل المذكرات الصوتية غير مدعوم في هذا المتصفح.');
            return;
        }

        try {
            clearVoiceNotePreview();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const chunks = audioChunksRef.current;
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    setVoiceNoteBlob(blob);
                    const previewUrl = URL.createObjectURL(blob);
                    voiceNoteUrlRef.current = previewUrl;
                    setVoiceNoteUrl(previewUrl);
                }
                audioChunksRef.current = [];
                mediaStreamRef.current?.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
                setIsVoiceNoteRecording(false);
            };

            recorder.start();
            setVoiceNoteError(null);
            setIsVoiceNoteRecording(true);
        } catch (error) {
            console.error('Voice note recording error:', error);
            setVoiceNoteError(language === 'en'
                ? 'Unable to access the microphone. Please allow microphone permissions.'
                : 'تعذر الوصول إلى الميكروفون. يرجى السماح بأذونات الميكروفون.');
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
            setIsVoiceNoteRecording(false);
        }
    };

    const stopVoiceNoteRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        setIsVoiceNoteRecording(false);
    };

    const handleComposeModeChange = (mode: 'text' | 'voice') => {
        if (mode === composeMode) return;
        if (mode === 'text' && isVoiceNoteRecording) {
            stopVoiceNoteRecording();
        }
        setComposeMode(mode);
        if (mode === 'voice') {
            setVoiceNoteError(null);
        }
    };

    const handleSendMessage = async () => {
        if (composeMode === 'voice') {
            if (!voiceNoteBlob) {
                setVoiceNoteError(language === 'en'
                    ? 'Please record a voice note before sending.'
                    : 'يرجى تسجيل مذكرة صوتية قبل الإرسال.');
                return;
            }

            const messageAudioUrl = URL.createObjectURL(voiceNoteBlob);
            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                audioUrl: messageAudioUrl,
                content: language === 'en' ? 'Voice note' : 'مذكرة صوتية',
                mediaType: 'audio',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);
            setVoiceNoteError(null);
            clearVoiceNotePreview();
            setComposeMode('text');

            setTimeout(() => {
                const aiResponse = generateAIResponse('', language, { mode: 'audio' });
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: aiResponse,
                    mediaType: 'text',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
                setIsLoading(false);
            }, 1500);

            return;
        }

        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage) {
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: trimmedMessage,
            mediaType: 'text',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        setTimeout(() => {
            const aiResponse = generateAIResponse(trimmedMessage, language);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                mediaType: 'text',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (composeMode !== 'text') {
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionAction = (id: string, action: 'take' | 'dismiss' | 'remind') => {
        setSuggestions(prev => prev.map(sug => {
            if (sug.id === id) {
                if (action === 'take') return { ...sug, status: 'in-progress' };
                if (action === 'dismiss') return { ...sug, status: 'dismissed' };
            }
            return sug;
        }));
    };

    const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
        if (typeof window === 'undefined') {
            return null;
        }

        const speechWindow = window as ExtendedSpeechRecognitionWindow;
        return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
    };

    const extractTranscript = (event: SpeechRecognitionResultEventLike): string => {
        const firstResult = event.results[0];
        const firstAlternative = firstResult?.[0];
        return firstAlternative?.transcript ?? '';
    };

    const handleVoiceInput = () => {
        if (composeMode !== 'text') {
            setComposeMode('text');
        }
        if (isVoiceNoteRecording) {
            stopVoiceNoteRecording();
        }
        const SpeechRecognitionCtor = getSpeechRecognitionConstructor();

        if (!SpeechRecognitionCtor) {
            alert(language === 'en'
                ? 'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.'
                : 'الإدخال الصوتي غير مدعوم في متصفحك. يرجى استخدام Chrome أو Edge أو Safari.');
            return;
        }

        if (isRecording) {
            // Stop recording
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            return;
        }

        // Start recording
        const recognition = new SpeechRecognitionCtor();

        recognition.lang = language === 'en' ? 'en-US' : 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
            const transcript = extractTranscript(event);
            if (transcript) {
                setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
            setIsRecording(false);
            // Only log and alert for actual errors, not for "no-speech" (which is a normal scenario)
            if (event.error !== 'no-speech') {
                console.error('Speech recognition error:', event.error);
                alert(language === 'en'
                    ? `Voice input error: ${event.error}`
                    : `خطأ في الإدخال الصوتي: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const getPriorityColor = (priority: PriorityLevel) => {
        switch (priority) {
            case 'critical': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'high': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
            case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            default: return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        }
    };

    const getPriorityIcon = (priority: PriorityLevel) => {
        switch (priority) {
            case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'high': return <TrendingUp className="w-4 h-4 text-orange-600" />;
            case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <CheckCircle className="w-4 h-4 text-green-600" />;
        }
    };

    const getStatusBadge = (status: SuggestionStatus) => {
        const badges: Record<SuggestionStatus, { label: string; color: string }> = {
            'new': { label: language === 'en' ? 'New' : 'جديد', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
            'in-progress': { label: language === 'en' ? 'In Progress' : 'قيد التنفيذ', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
            'completed': { label: language === 'en' ? 'Completed' : 'مكتمل', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
            'dismissed': { label: language === 'en' ? 'Dismissed' : 'تم التجاهل', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' }
        };
        return badges[status];
    };

    const quickPrompts: Array<{ icon: string; text: string }> = [
        { icon: '📊', text: language === 'en' ? 'System status overview' : 'نظرة عامة على حالة النظام' },
        { icon: '👥', text: language === 'en' ? 'High-risk employees' : 'الموظفون عالي الخطر' },
        { icon: '📈', text: language === 'en' ? 'Weekly trends analysis' : 'تحليل الاتجاهات الأسبوعية' },
        { icon: '💡', text: language === 'en' ? 'Suggest interventions' : 'اقترح تدخلات' }
    ];

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-gray-50 dark:bg-[var(--background)]">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">
                            {language === 'en' ? 'AI Wellbeing Advisor' : 'المستشار الذكي للصحة النفسية'}
                        </h1>
                        <p className="text-white/90">
                            {language === 'en'
                                ? 'Smart recommendations, real-time insights, and conversational AI to maintain team wellbeing'
                                : 'توصيات ذكية، رؤى فورية، وذكاء اصطناعي تحادثي للحفاظ على صحة الفريق'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span className="text-sm font-semibold">{language === 'en' ? 'AI Powered' : 'مدعوم بالذكاء'}</span>
                    </div>
                </div>
            </div>

            {/* AI Suggestions Cards */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        {language === 'en' ? 'AI Suggestions' : 'الاقتراحات الذكية'}
                    </h2>
                    {suggestions.filter(s => s.status === 'new').length > 0 && (
                        <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-bold">
                            {suggestions.filter(s => s.status === 'new').length} {language === 'en' ? 'New' : 'جديد'}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {suggestions
                        .filter(s => s.status !== 'dismissed')
                        .slice(0, showAllSuggestions ? undefined : 2)
                        .map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className={`p-5 rounded-xl border-2 ${getPriorityColor(suggestion.priority)} transition-all hover:shadow-lg bg-white dark:bg-gray-800`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl flex-shrink-0">
                                        {suggestion.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {getPriorityIcon(suggestion.priority)}
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {language === 'en' ? suggestion.title : suggestion.titleAr}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(suggestion.status).color}`}>
                                                {getStatusBadge(suggestion.status).label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>{language === 'en' ? 'Target:' : 'الهدف:'}</strong> {suggestion.employee}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                                            {language === 'en' ? suggestion.message : suggestion.messageAr}
                                        </p>
                                        {suggestion.status === 'new' && (
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleSuggestionAction(suggestion.id, 'take')}
                                                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                                                >
                                                    {language === 'en' ? 'Take Action' : 'اتخذ إجراء'}
                                                </button>
                                                <button
                                                    onClick={() => handleSuggestionAction(suggestion.id, 'remind')}
                                                    className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                                >
                                                    {language === 'en' ? 'Remind Later' : 'تذكير لاحقاً'}
                                                </button>
                                                <button
                                                    onClick={() => handleSuggestionAction(suggestion.id, 'dismiss')}
                                                    className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    {language === 'en' ? 'Dismiss' : 'تجاهل'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Show More/Less Button */}
                {suggestions.filter(s => s.status !== 'dismissed').length > 2 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                        >
                            {showAllSuggestions
                                ? (language === 'en' ? 'Show Less' : 'إخفاء')
                                : (language === 'en' ? 'View All Suggestions' : 'مشاهدة المزيد')}
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {language === 'en' ? 'Chat with AI Advisor' : 'تحدث مع المستشار الذكي'}
                        </h3>
                    </div>
                </div>

                <div className="flex flex-col h-[500px]">
                    {/* Messages Area */}
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {message.mediaType === 'audio' && message.audioUrl ? (
                                        <div className="space-y-2">
                                            <div className={`flex items-center gap-2 text-sm font-semibold ${message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                <FileAudio className="w-4 h-4" />
                                                <span>{message.content ?? (language === 'en' ? 'Voice note' : 'مذكرة صوتية')}</span>
                                            </div>
                                            <audio controls src={message.audioUrl} className="w-full" preload="metadata" />
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    )}
                                    <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-SA', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div className="px-6 pb-2">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInputMessage(prompt.text)}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm whitespace-nowrap transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <span>{prompt.icon}</span>
                                    <span className="text-gray-700 dark:text-gray-300">{prompt.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleComposeModeChange('text')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${composeMode === 'text'
                                        ? 'border-purple-500 text-purple-600 dark:text-purple-300 bg-white dark:bg-gray-800'
                                        : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:border-purple-500'}`}
                                    title={language === 'en' ? 'Text mode' : 'وضع النص'}
                                >
                                    <Type className="w-4 h-4" />
                                    <span className="text-sm font-medium">{language === 'en' ? 'Text mode' : 'رسالة نصية'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleComposeModeChange('voice')}
                                    disabled={!isVoiceSupportAvailable}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${composeMode === 'voice'
                                        ? 'border-purple-500 text-purple-600 dark:text-purple-300 bg-white dark:bg-gray-800'
                                        : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:border-purple-500'} ${!isVoiceSupportAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={language === 'en' ? 'Voice note mode' : 'وضع المذكرة الصوتية'}
                                >
                                    <FileAudio className="w-4 h-4" />
                                    <span className="text-sm font-medium">{language === 'en' ? 'Voice note' : 'مذكرة صوتية'}</span>
                                </button>
                            </div>

                            {composeMode === 'text' ? (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleVoiceInput}
                                        className={`p-3 rounded-xl transition-all ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        title={language === 'en' ? 'Voice dictation' : 'إملاء صوتي'}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={language === 'en' ? 'Ask me anything about employee wellbeing...' : 'اسألني أي شيء عن صحة الموظفين...'}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                                        rows={2}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={isVoiceNoteRecording ? stopVoiceNoteRecording : startVoiceNoteRecording}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isVoiceNoteRecording
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                                }`}
                                            title={language === 'en' ? 'Record voice note' : 'تسجيل مذكرة صوتية'}
                                        >
                                            {isVoiceNoteRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            <span className="text-sm font-medium">
                                                {isVoiceNoteRecording
                                                    ? (language === 'en' ? 'Stop recording' : 'إيقاف التسجيل')
                                                    : (language === 'en' ? 'Start recording' : 'ابدأ التسجيل')}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleComposeModeChange('text');
                                                handleVoiceInput();
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
                                        >
                                            <Type className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {language === 'en' ? 'Dictate instead' : 'استخدم الإملاء النصي'}
                                            </span>
                                        </button>
                                    </div>
                                    {voiceNoteError && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{voiceNoteError}</p>
                                    )}
                                    {voiceNoteUrl ? (
                                        <div className="space-y-2 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                <FileAudio className="w-4 h-4" />
                                                <span>{language === 'en' ? 'Voice note ready' : 'المذكرة الصوتية جاهزة'}</span>
                                            </div>
                                            <audio controls src={voiceNoteUrl} className="w-full" preload="metadata" />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={clearVoiceNotePreview}
                                                    className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    {language === 'en' ? 'Discard' : 'إلغاء'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {language === 'en'
                                                ? (isVoiceSupportAvailable
                                                    ? 'Press record to capture a voice note you can send directly to the advisor.'
                                                    : 'Voice note recording is not supported in this browser.')
                                                : (isVoiceSupportAvailable
                                                    ? 'اضغط على تسجيل لالتقاط مذكرة صوتية وإرسالها للمستشار.'
                                                    : 'تسجيل المذكرات الصوتية غير مدعوم في هذا المتصفح.')}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || (composeMode === 'text' ? !inputMessage.trim() : !voiceNoteBlob || isVoiceNoteRecording)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    {language === 'en' ? 'Send' : 'إرسال'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// AI Response Generator (Mock)
function generateAIResponse(query: string, language: string, options?: { mode?: 'text' | 'audio' }): string {
    if (options?.mode === 'audio') {
        return language === 'en'
            ? `🎙️ I've received your voice note and analyzed the sentiment. Here's a quick summary:

• Emotional tone: Calm and solution-focused
• Urgency detected: Moderate
• Recommended follow-up: Schedule a 15-minute check-in with the relevant manager

Would you like me to transcribe key highlights or create an action plan?`
            : `🎙️ استلمت مذكرتك الصوتية وقمت بتحليل المشاعر. إليك ملخص سريع:

• النبرة العاطفية: هادئة ومركزة على الحلول
• مستوى الاستعجال: متوسط
• المتابعة الموصى بها: جدولة اجتماع متابعة قصير مع المدير المعني

هل ترغب أن أكتب أبرز النقاط أو أعد خطة عمل؟`;
    }

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('status') || lowerQuery.includes('overview') || lowerQuery.includes('حالة') || lowerQuery.includes('نظرة')) {
        return language === 'en'
            ? `📊 **System Status Overview:**\n\n✅ Overall Health: Good (78%)\n👥 Active Employees: 132/147\n🚨 High Risk: 8 employees requiring attention\n📈 Trend: Improving (+12% vs last week)\n\nKey Highlights:\n• Engineering team shows 15% improvement\n• Sales department needs intervention (stress levels rising)\n• 89% of employees in low-risk category\n\nWould you like detailed analytics for a specific department?`
            : `📊 **نظرة عامة على حالة النظام:**\n\n✅ الصحة العامة: جيدة (78%)\n👥 الموظفون النشطون: 132/147\n🚨 خطر عالي: 8 موظفين يحتاجون اهتمام\n📈 الاتجاه: تحسن (+12% مقارنة بالأسبوع الماضي)\n\nأبرز النقاط:\n• فريق الهندسة يظهر تحسن 15%\n• قسم المبيعات يحتاج تدخل (مستويات الضغط ترتفع)\n• 89% من الموظفين في فئة خطر منخفض\n\nهل تريد تحليلات مفصلة لقسم معين؟`;
    }

    if (lowerQuery.includes('risk') || lowerQuery.includes('high') || lowerQuery.includes('خطر') || lowerQuery.includes('عالي')) {
        return language === 'en'
            ? `🚨 **High-Risk Employees Analysis:**\n\n8 employees currently flagged as high-risk:\n\n1. **Sara Al-Fahad** (Sales) - Critical\n   • 3 weeks of high stress\n   • Recommendation: Immediate 5-7 days leave\n\n2. **Ahmed Youssef** (Engineering) - High\n   • Declining mood trend\n   • Recommendation: Workload redistribution\n\n3. **Fatima Ali** (Marketing) - High\n   • Low engagement (2 check-ins/week)\n   • Recommendation: 1-on-1 meeting\n\nFull list and intervention strategies available in detailed report. Would you like me to generate it?`
            : `🚨 **تحليل الموظفين عالي الخطر:**\n\n8 موظفين حالياً في فئة خطر عالي:\n\n1. **سارة الفهد** (المبيعات) - حرج\n   • 3 أسابيع من الضغط العالي\n   • التوصية: إجازة فورية 5-7 أيام\n\n2. **أحمد يوسف** (الهندسة) - عالي\n   • اتجاه مزاج متراجع\n   • التوصية: إعادة توزيع العمل\n\n3. **فاطمة علي** (التسويق) - عالي\n   • مشاركة منخفضة (تسجيلان/أسبوع)\n   • التوصية: اجتماع فردي\n\nالقائمة الكاملة واستراتيجيات التدخل متاحة في تقرير مفصل. هل تريد مني إنشاؤه؟`;
    }

    if (lowerQuery.includes('trend') || lowerQuery.includes('analysis') || lowerQuery.includes('اتجاه') || lowerQuery.includes('تحليل')) {
        return language === 'en'
            ? `📈 **Weekly Trends Analysis:**\n\n**Mood Scores:**\n• Average: 7.2/10 (↑ 0.5 from last week)\n• Peak Day: Friday (8.0/10)\n• Low Day: Monday (6.8/10)\n\n**Department Performance:**\n🏆 Best: Design Team (8.1/10)\n⚠️ Needs Attention: Sales (6.2/10)\n\n**Key Patterns:**\n• Monday blues detected - consider flexible starts\n• Friday positivity - maintain current approach\n• Post-lunch dip (2-3 PM) - suggest breaks\n\n**Predictions:**\n• If current trend continues, overall wellbeing will reach 82% by month-end\n• Engineering team on track for "Excellent" status\n\nNeed deeper insights on a specific metric?`
            : `📈 **تحليل الاتجاهات الأسبوعية:**\n\n**درجات المزاج:**\n• المتوسط: 7.2/10 (↑ 0.5 عن الأسبوع الماضي)\n• أفضل يوم: الجمعة (8.0/10)\n• أقل يوم: الاثنين (6.8/10)\n\n**أداء الأقسام:**\n🏆 الأفضل: فريق التصميم (8.1/10)\n⚠️ يحتاج اهتمام: المبيعات (6.2/10)\n\n**الأنماط الرئيسية:**\n• كآبة الاثنين مكتشفة - فكر في بدايات مرنة\n• إيجابية الجمعة - حافظ على النهج الحالي\n• انخفاض بعد الغداء (2-3 م) - اقترح استراحات\n\n**التوقعات:**\n• إذا استمر الاتجاه الحالي، الصحة العامة ستصل 82% بنهاية الشهر\n• فريق الهندسة في طريقه لحالة "ممتاز"\n\nهل تحتاج رؤى أعمق عن مقياس معين؟`;
    }

    if (lowerQuery.includes('suggest') || lowerQuery.includes('intervention') || lowerQuery.includes('اقترح') || lowerQuery.includes('تدخل')) {
        return language === 'en'
            ? `💡 **Recommended Interventions:**\n\nBased on current data, here are my top 5 suggestions:\n\n1. **Immediate:** Schedule vacation for Sara Al-Fahad (Sales)\n2. **This Week:** Organize team building event for Engineering\n3. **Next Week:** Stress management workshop for Sales dept\n4. **Ongoing:** Implement flexible hours for high-stress roles\n5. **Recognition:** Public acknowledgment for top performers\n\n**Priority Actions:**\n🔴 3 critical interventions needed today\n🟡 5 medium-priority items this week\n🟢 7 preventive measures for next month\n\nWould you like detailed implementation plans for any of these?`
            : `💡 **التدخلات الموصى بها:**\n\nبناءً على البيانات الحالية، هذه أهم 5 اقتراحات:\n\n1. **فوري:** جدول إجازة لسارة الفهد (المبيعات)\n2. **هذا الأسبوع:** نظم فعالية بناء فريق للهندسة\n3. **الأسبوع القادم:** ورشة إدارة ضغط لقسم المبيعات\n4. **مستمر:** طبق ساعات مرنة للأدوار عالية الضغط\n5. **تقدير:** اعتراف علني للمتميزين\n\n**إجراءات الأولوية:**\n🔴 3 تدخلات حرجة مطلوبة اليوم\n🟡 5 عناصر متوسطة الأولوية هذا الأسبوع\n🟢 7 إجراءات وقائية للشهر القادم\n\nهل تريد خطط تنفيذ مفصلة لأي منها؟`;
    }

    // Default response
    return language === 'en'
        ? `I understand you're asking about "${query}". \n\nI can help you with:\n\n📊 System status and health metrics\n👥 Employee analytics and insights\n📈 Trend analysis and predictions\n🚨 Risk assessment and interventions\n📝 Custom reports generation\n💡 Personalized recommendations\n\nCould you please be more specific about what you'd like to know? For example:\n• "Show me employees at risk"\n• "Generate a weekly report"\n• "What's the mood trend this month?"\n• "Suggest interventions for Sales team"`
        : `أفهم أنك تسأل عن "${query}".\n\nيمكنني مساعدتك في:\n\n📊 حالة النظام ومقاييس الصحة\n👥 تحليلات ورؤى الموظفين\n📈 تحليل الاتجاهات والتوقعات\n🚨 تقييم المخاطر والتدخلات\n📝 إنشاء تقارير مخصصة\n💡 توصيات شخصية\n\nهل يمكنك أن تكون أكثر تحديداً حول ما تريد معرفته؟ على سبيل المثال:\n• "أرني الموظفين المعرضين للخطر"\n• "أنشئ تقرير أسبوعي"\n• "ما اتجاه المزاج هذا الشهر؟"\n• "اقترح تدخلات لفريق المبيعات"`;
}
