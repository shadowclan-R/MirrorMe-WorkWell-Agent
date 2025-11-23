import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { EmployeeDataProvider } from "@/contexts/EmployeeDataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MirrorMe WorkWell - Your Digital Twin for Workplace Wellbeing",
  description: "AI-powered workplace wellness companion that helps you track mood, reduce stress, and maintain work-life balance.",
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RoleProvider>
          <AppProvider>
            <EmployeeDataProvider>
              {children}
            </EmployeeDataProvider>
          </AppProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
