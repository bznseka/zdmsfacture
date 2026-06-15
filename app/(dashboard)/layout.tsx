'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 tracking-wide">
            Chargement de la session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6]">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main page content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic page content */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
