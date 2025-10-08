// src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import { UnreadMessagesProvider } from '@/contexts/UnreadMessagesContext';

const DashboardLayout = () => {
  return (
    <UnreadMessagesProvider>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-financial-sky via-background to-white">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-financial-mint/60 blur-3xl" />
          <div className="absolute bottom-[-10rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-financial-blue/25 blur-3xl" />
          <div className="absolute inset-x-1/4 top-[18%] h-64 w-[50vw] rounded-full bg-white/60 blur-[120px]" />
        </div>

        <header className="relative z-20">
          <Navbar />
        </header>

        <div className="relative z-10 flex flex-1 overflow-hidden">
          <div className="fixed inset-y-0 left-0 z-30">
            <Sidebar />
          </div>

          <main className="ml-0 flex-1 overflow-y-auto pb-16 pt-4 transition-all duration-200 md:ml-64">
            <div className="flex h-full min-h-0 w-full max-w-6xl flex-col px-4 sm:px-8 md:px-10 lg:px-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </UnreadMessagesProvider>
  );
};

export default DashboardLayout;