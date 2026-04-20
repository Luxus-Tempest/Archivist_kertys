import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next'

export function SidebarNew() {
  const { t } = useTranslation()
  const navItems = [
    { name: t('sidebar.explorer', 'Explorer'), icon: 'folder', path: '/explorer' },
    { name: t('sidebar.history', 'History'), icon: 'history', path: '/history' },
    { name: t('sidebar.process', 'Process'), icon: 'add', path: '/process' },
  ];

  return (
    // <aside className="hidden md:flex flex-col p-4 -mt-2 border-r border-outline-variant/45 gap-2 h-[calc(100vh-80px)] w-64 fixed left-0 bg-[#EEF2F5] font-body text-sm font-medium">
    <aside className="hidden md:flex flex-col p-4 -mt-2 border-r border-outline-variant/45 gap-2 h-[calc(100vh-80px)] w-64 fixed left-0 bg-surface font-body text-sm font-medium">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg ${
                isActive && item.path !== '#'
                  ? 'text-slate-900 bg-white shadow-sm translate-x-1'
                  : 'text-slate-500 hover:text-slate-700 hover:translate-x-1'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
