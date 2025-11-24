'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HRSidebar from '@/components/HRSidebar';
import TopBar from '@/components/TopBar';
import ChatView from '@/components/ChatView';
import DashboardView from '@/components/DashboardView';
import ProfileView from '@/components/ProfileView';
import SettingsView from '@/components/SettingsView';
import DigitalTwinReportView from '@/components/DigitalTwinReportView';
import IntegrationsView from '@/components/IntegrationsView';
import HRDashboardView from '@/components/HRDashboardView';
import HRAIAdvisorView from '@/components/HRAIAdvisorView';
import HREmployeesView from '@/components/HREmployeesView';
import HRAnalyticsView from '@/components/HRAnalyticsView';
import HRReportsView from '@/components/HRReportsView';
import HRAlertsView from '@/components/HRAlertsView';
import LoginPage from '@/components/LoginPage';
import { useRole } from '@/contexts/RoleContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useApp } from '@/contexts/AppContext';

export default function Home() {
  const { role, setRole, isAuthenticated } = useRole();
  const { language } = useApp();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Employee views
  const [employeeSidebarOpen, setEmployeeSidebarOpen] = useState(false);
  const [employeeActiveView, setEmployeeActiveView] = useState<'chat' | 'dashboard' | 'profile' | 'settings' | 'report' | 'integrations'>('dashboard');

  // HR Manager views
  const [hrSidebarOpen, setHRSidebarOpen] = useState(false);
  const [hrActiveView, setHRActiveView] = useState<'dashboard' | 'ai-advisor' | 'employees' | 'analytics' | 'reports' | 'alerts' | 'settings'>('dashboard');

  // Show loading state during SSR and initial mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated || !role) {
    return <LoginPage onRoleSelect={setRole} />;
  }

  // Employee Interface
  if (role === 'employee') {
    const renderEmployeeView = () => {
      switch (employeeActiveView) {
        case 'dashboard':
          return <DashboardView setActiveView={setEmployeeActiveView} />;
        case 'chat':
          return <ChatView />;
        case 'profile':
          return <ProfileView />;
        case 'settings':
          return <SettingsView />;
        case 'report':
          return <DigitalTwinReportView />;
        case 'integrations':
          return <IntegrationsView />;
        default:
          return <DashboardView setActiveView={setEmployeeActiveView} />;
      }
    };

    return (
      <NotificationProvider role="employee">
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
          <Sidebar
            isOpen={employeeSidebarOpen}
            setIsOpen={setEmployeeSidebarOpen}
            activeView={employeeActiveView}
            setActiveView={setEmployeeActiveView}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar onMenuClick={() => setEmployeeSidebarOpen(!employeeSidebarOpen)} />
            <main className="flex-1 overflow-hidden bg-[var(--background)]">
              {renderEmployeeView()}
            </main>
            <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-3 px-4 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'en' ? 'Made by team ' : 'صنع بواسطة فريق '}
                <a
                  href="https://codksoft.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline font-semibold"
                >
                  codk
                </a>
              </p>
            </footer>
          </div>
        </div>
      </NotificationProvider>
    );
  }

  // HR Manager Interface
  if (role === 'hr') {
    const renderHRView = () => {
      switch (hrActiveView) {
        case 'dashboard':
          return <HRDashboardView onNavigateToAIAdvisor={() => setHRActiveView('ai-advisor')} />;
        case 'ai-advisor':
          return <HRAIAdvisorView />;
        case 'employees':
          return <HREmployeesView />;
        case 'analytics':
          return <HRAnalyticsView />;
        case 'reports':
          return <HRReportsView />;
        case 'alerts':
          return <HRAlertsView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <HRDashboardView onNavigateToAIAdvisor={() => setHRActiveView('ai-advisor')} />;
      }
    };

    return (
      <NotificationProvider role="hr">
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
          <HRSidebar
            isOpen={hrSidebarOpen}
            setIsOpen={setHRSidebarOpen}
            activeView={hrActiveView}
            setActiveView={setHRActiveView}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar onMenuClick={() => setHRSidebarOpen(!hrSidebarOpen)} />
            <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
              {renderHRView()}
            </main>
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Made by team ' : 'صنع بواسطة فريق '}
                <a
                  href="https://codksoft.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  codk
                </a>
              </p>
            </footer>
          </div>
        </div>
      </NotificationProvider>
    );
  }

  return null;
}
