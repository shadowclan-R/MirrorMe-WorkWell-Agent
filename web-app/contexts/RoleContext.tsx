'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Role = 'employee' | 'hr' | null;

type RoleContextType = {
    role: Role;
    setRole: (role: Role) => void;
    isAuthenticated: boolean;
    logout: () => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<Role>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('userRole') as Role | null;
            return saved;
        }
        return null;
    });

    // Save role to localStorage when it changes
    useEffect(() => {
        if (role) {
            localStorage.setItem('userRole', role);
        } else {
            localStorage.removeItem('userRole');
        }
    }, [role]);

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
    };

    const logout = () => {
        setRoleState(null);
        localStorage.removeItem('userRole');
    };

    const isAuthenticated = role !== null;

    return (
        <RoleContext.Provider value={{ role, setRole, isAuthenticated, logout }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within RoleProvider');
    }
    return context;
}
