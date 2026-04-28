import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HeaderNew } from './HeaderNew';
import { SidebarNew } from './SidebarNew';
import { useTranslation } from 'react-i18next'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface DashboardLayoutNewProps {
  children: React.ReactNode;
  isFullWidth?: boolean;
}
export function DashboardLayoutNew({ children, isFullWidth = false }: DashboardLayoutNewProps) {
  const { t } = useTranslation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const handleToggleSidebar = (value: boolean) => {
    setIsSidebarCollapsed(value);
    localStorage.setItem('sidebar_collapsed', String(value));
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary/20 h-screen overflow-hidden flex flex-col">
      <HeaderNew />
      
      <div className="flex flex-1 pt-16 min-h-0 overflow-hidden relative">
        <SidebarNew 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={handleToggleSidebar} 
        />
        
        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col bg-white ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} transition-all duration-300 ease-in-out min-w-0 overflow-hidden w-full ${isFullWidth ? 'pb-0 pt-0' : 'p-2 lg:p-2 pb-0 mx-auto w-full'}`}>

          <div className="flex-1 overflow-y-auto pb-16 bg-white">
            {children}
          </div>
        </main>
      </div>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-8 px-4 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-50 rounded-t-3xl font-body text-[10px] uppercase tracking-widest">
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            `flex flex-col items-center transition-all ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 opacity-80'}`
          }
        >
          <HomeRoundedIcon className="mb-1" sx={{ fontSize: 24 }} />
          {t('menu.home', 'Home')}
        </NavLink>
        <NavLink 
          to="/process" 
          className={({ isActive }) => 
            `flex flex-col items-center transition-all ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 opacity-80'}`
          }
        >
          <DescriptionRoundedIcon className="mb-1" sx={{ fontSize: 24 }} />
          {t('menu.files', 'Files')}
        </NavLink>
        <NavLink 
          to="#" 
          className="flex flex-col items-center text-slate-400 opacity-80"
        >
          <FolderSharedRoundedIcon className="mb-1" sx={{ fontSize: 24 }} />
          {t('menu.shared', 'Shared')}
        </NavLink>
        <NavLink 
          to="#" 
          className="flex flex-col items-center text-slate-400 opacity-80"
        >
          <SearchRoundedIcon className="mb-1" sx={{ fontSize: 24 }} />
          {t('menu.search', 'Search')}
        </NavLink>
      </nav>
    </div>
  );
}
