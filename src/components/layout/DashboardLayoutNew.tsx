import React from 'react';
import { NavLink } from 'react-router-dom';
import { HeaderNew } from './HeaderNew';
import { SidebarNew } from './SidebarNew';

interface DashboardLayoutNewProps {
  children: React.ReactNode;
}

export function DashboardLayoutNew({ children }: DashboardLayoutNewProps) {
  return (
    <div className="bg-surface text-on-surface selection:bg-primary/20 min-h-screen">
      <HeaderNew />
      
      <div className="flex pt-20 min-h-screen">
        <SidebarNew />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 lg:p-12 max-w-7xl mx-auto w-full pb-32">
          {children}
        </main>
      </div>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-8 px-4 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-50 rounded-t-3xl font-body text-[10px] uppercase tracking-widest">
        <NavLink 
          to="/history-new" 
          className={({ isActive }) => 
            `flex flex-col items-center transition-all ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 opacity-80'}`
          }
        >
          <span className="material-symbols-outlined mb-1">home</span>
          Home
        </NavLink>
        <NavLink 
          to="/process-new" 
          className={({ isActive }) => 
            `flex flex-col items-center transition-all ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 opacity-80'}`
          }
        >
          <span className="material-symbols-outlined mb-1">description</span>
          Files
        </NavLink>
        <NavLink 
          to="#" 
          className="flex flex-col items-center text-slate-400 opacity-80"
        >
          <span className="material-symbols-outlined mb-1">folder_shared</span>
          Shared
        </NavLink>
        <NavLink 
          to="#" 
          className="flex flex-col items-center text-slate-400 opacity-80"
        >
          <span className="material-symbols-outlined mb-1">search</span>
          Search
        </NavLink>
      </nav>
    </div>
  );
}
