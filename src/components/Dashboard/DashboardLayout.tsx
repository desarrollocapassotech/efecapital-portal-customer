// src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import { UnreadMessagesProvider } from '@/contexts/UnreadMessagesContext';
import { UnreadReportsProvider } from '@/contexts/UnreadReportsContext';

const DashboardLayout = () => {
  return (
    <UnreadMessagesProvider>
      <UnreadReportsProvider>
        <div className="flex flex-col h-screen bg-background">
          {/* Navbar superior */}
          <header>
            <Navbar />
          </header>

          {/* Contenido principal */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-10">
              <Sidebar />
            </div>

            {/* Main */}
            <main className="flex-1 overflow-y-auto ml-0 md:ml-64">
              {/* Contenedor que ocupa todo el alto disponible */}
              <div className="flex flex-col h-full min-h-0 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 sm:py-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </UnreadReportsProvider>
    </UnreadMessagesProvider>
  );
};

export default DashboardLayout;