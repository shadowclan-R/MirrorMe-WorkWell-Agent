'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useEmployeeData, type EmployeeData } from '@/hooks/useSupabaseData';
import { supabaseBrowserClient } from '@/lib/supabaseBrowserClient';

export type ChatLogEntry = {
    id: string;
    employee_id: string;
    role: 'user' | 'assistant';
    content: string | null;
    media_type?: string | null;
    audio_url?: string | null;
    timestamp: string;
};

type EmployeeDataContextValue = {
    employee: EmployeeData | null;
    employeeEmail: string | null;
    loading: boolean;
    error: string | null;
    refreshEmployee: () => void;
    setEmployeeEmail: (email: string) => void;
    chatHistory: ChatLogEntry[];
    chatLoading: boolean;
    chatError: string | null;
    refreshChatHistory: () => void;
};

const EmployeeDataContext = createContext<EmployeeDataContextValue | undefined>(undefined);

const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_EMAIL ?? 'ryan.alfaid@company.com';

export function EmployeeDataProvider({ children }: { children: ReactNode }) {
    const [employeeEmail, setEmployeeEmail] = useState<string>(() => {
        if (typeof window === 'undefined') {
            return DEFAULT_EMAIL;
        }
        return localStorage.getItem('employeeEmail') ?? DEFAULT_EMAIL;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('employeeEmail', employeeEmail);
        }
    }, [employeeEmail]);

    const [refreshSignal, setRefreshSignal] = useState(0);
    const { data, loading, error } = useEmployeeData(employeeEmail, refreshSignal);

    const refreshEmployee = () => setRefreshSignal((prev) => prev + 1);

    const [chatHistory, setChatHistory] = useState<ChatLogEntry[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [chatRefreshSignal, setChatRefreshSignal] = useState(0);

    useEffect(() => {
        if (!data?.id) {
            return;
        }

        let isMounted = true;

        queueMicrotask(() => {
            if (!isMounted) {
                return;
            }
            setChatLoading(true);
            setChatError(null);
        });

        const fetchHistory = async () => {
            try {
                const { data: rows, error: fetchError } = await supabaseBrowserClient
                    .from('chat_logs')
                    .select('*')
                    .eq('employee_id', data.id as string)
                    .order('timestamp', { ascending: true });

                if (!isMounted) {
                    return;
                }

                if (fetchError) {
                    console.error('Failed to load chat history:', fetchError);
                    setChatError(fetchError.message);
                    setChatHistory([]);
                    return;
                }

                setChatHistory((rows as ChatLogEntry[] | null) ?? []);
            } catch (err) {
                if (!isMounted) {
                    return;
                }
                const message = err instanceof Error ? err.message : 'Unexpected chat history error';
                setChatError(message);
                setChatHistory([]);
            } finally {
                if (isMounted) {
                    setChatLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            isMounted = false;
        };
    }, [data?.id, chatRefreshSignal]);

    useEffect(() => {
        if (data?.id) {
            return;
        }

        queueMicrotask(() => {
            setChatHistory([]);
            setChatError(null);
            setChatLoading(false);
        });
    }, [data?.id]);

    const refreshChatHistory = () => setChatRefreshSignal((prev) => prev + 1);

    const value = useMemo(
        () => ({
            employee: data,
            employeeEmail,
            loading,
            error,
            refreshEmployee,
            setEmployeeEmail,
            chatHistory,
            chatLoading,
            chatError,
            refreshChatHistory,
        }),
        [data, employeeEmail, loading, error, chatHistory, chatLoading, chatError],
    );

    return (
        <EmployeeDataContext.Provider value={value}>
            {children}
        </EmployeeDataContext.Provider>
    );
}

export function useEmployeeProfile() {
    const context = useContext(EmployeeDataContext);
    if (!context) {
        throw new Error('useEmployeeProfile must be used within EmployeeDataProvider');
    }
    return context;
}
