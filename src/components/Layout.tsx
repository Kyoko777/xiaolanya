import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-white/80 backdrop-blur-md flex flex-col">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 flex items-center px-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-500">电子病历系统</h1>
          </div>
          <div className="flex items-center space-x-4">
             {/* Window controls placeholder for Electron visual consistency if needed */}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </section>
      </main>
    </div>
  );
}
