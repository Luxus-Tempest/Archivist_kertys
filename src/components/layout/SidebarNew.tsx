import { NavLink } from 'react-router-dom';

export function SidebarNew() {
  const navItems = [
    { name: 'Library', icon: 'book', path: '/history-new' },
    { name: 'Activities', icon: 'history', path: '#' },
    { name: 'Shared', icon: 'group', path: '#' },
    { name: 'Archive', icon: 'inventory_2', path: '/process-new' },
  ];

  return (
    <aside className="hidden md:flex flex-col p-4 gap-2 h-[calc(100vh-80px)] w-64 fixed left-0 bg-surface font-body text-sm font-medium">
      <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Collections</p>
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
        
        <NavLink
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 hover:translate-x-1 transition-transform duration-200 mt-auto"
        >
          <span className="material-symbols-outlined">settings</span> Settings
        </NavLink>
      </nav>
    </aside>
  );
}
