import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#FAFAFA] text-zinc-900 antialiased flex h-screen overflow-hidden w-full">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b border-zinc-200 bg-white flex items-center px-4 justify-between shrink-0">
          <span className="font-semibold text-base text-zinc-900">Gestion Documentaire</span>
          <button 
            className="text-zinc-500 hover:text-zinc-700 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X strokeWidth={1.5} className="w-5 h-5" />
            ) : (
              <Menu strokeWidth={1.5} className="w-5 h-5" />
            )}
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-50 flex">
            {/* Overlay background */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sidebar content (reusing the logic from Sidebar somewhat, but rendered differently for mobile overlay) */}
            <div className="relative w-64 bg-white h-full z-10 animate-in slide-in-from-left duration-200">
               <Sidebar />
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
