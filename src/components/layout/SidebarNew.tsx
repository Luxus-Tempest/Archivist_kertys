import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next'

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function SidebarNew({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useTranslation()
  const navItems = [
    { name: t('sidebar.explorer', 'Explorer'), icon: 'folder', path: '/explorer' },
    { name: t('sidebar.history', 'History'), icon: 'history', path: '/history' },
    { name: t('sidebar.process', 'Process'), icon: 'add', path: '/process' },
  ];

  return (
    // <aside className="hidden md:flex flex-col p-4 -mt-2 border-r border-outline-variant/45 gap-2 h-[calc(100vh-80px)] w-64 fixed left-0 bg-[#EEF2F5] font-body text-sm font-medium">
    <aside className={`hidden md:flex flex-col p-3 -mt-2 border-r border-outline-variant/45 gap-2 h-[calc(100vh-80px)] ${isCollapsed ? 'w-16' : 'w-64'} fixed left-0 bg-surface font-body text-sm font-medium transition-all duration-300 ease-in-out z-40 group`}>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center group/item ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 transition-all duration-200 rounded-lg ${
                isActive && item.path !== '#'
                  ? 'text-slate-900 bg-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200'
              }`
            }
          >
            <span className={`material-symbols-outlined transition-all duration-300 ${isCollapsed ? 'text-xl' : 'text-lg'}`}>
              {item.icon}
            </span>
            
            {!isCollapsed && (
              <span className="truncate opacity-100 transition-opacity duration-300">
                {item.name}
              </span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg uppercase tracking-wider font-bold">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute cursor-pointer -right-[17px] top-1/2 -translate-y-1/2 
                   w-4 h-14 bg-surface 
                   border-y border-r border-outline-variant/45 
                   rounded-r-xl flex items-center justify-center 
                   text-slate-400 hover:text-slate-900 transition-all z-50
                   hover:w-5 hover:-right-[21px] group-hover:border-outline-variant`}
        title={isCollapsed ? t('sidebar.expand', 'Expand') : t('sidebar.collapse', 'Collapse')}
      >
        <span className="material-symbols-outlined text-[18px] font-light">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </aside>
  );
}
