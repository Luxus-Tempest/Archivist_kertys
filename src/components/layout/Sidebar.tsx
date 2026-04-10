import {
  Zap,
  PanelLeftClose,
  Search,
  Home,
  GitBranch,
  UploadCloud,
  History,
  Settings,
  HelpCircle,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Accueil', icon: Home, path: '/' },
    // { name: 'Workflows', icon: GitBranch, path: '/workflows' },
    { name: 'Traiter les fichiers', icon: UploadCloud, path: '/process' },
    { name: 'Historique', icon: History, path: '/history' },
  ];

  const otherItems = [
    { name: 'Paramètres', icon: Settings, path: '/settings' },
    // { name: 'Aide', icon: HelpCircle, path: '/help' },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 shrink-0 hidden md:flex flex-col bg-white">
      {/* Logo Area */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center text-white">
            <Zap strokeWidth={1.5} className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base">Gestion Documentaire</span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <PanelLeftClose strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-zinc-200">
        <div className="relative flex items-center">
          <Search strokeWidth={1.5} className="w-4 h-4 absolute left-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 transition-all placeholder:text-zinc-400"
          />
          <div className="absolute right-2 flex gap-1">
            <kbd className="text-xs text-zinc-400 font-sans">⌘</kbd>
            <kbd className="text-xs text-zinc-400 font-sans">F</kbd>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <div className="text-xs font-medium text-zinc-400 mb-2 px-2 tracking-wider">MENU</div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/process' && location.pathname === '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-2 py-1.5 text-base rounded-md transition-colors ${
                    isActive
                      ? 'text-zinc-900 bg-zinc-100 font-medium'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon strokeWidth={1.5} className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-xs font-medium text-zinc-400 mb-2 px-2 tracking-wider">AUTRES</div>
          <nav className="space-y-0.5">
            {otherItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-2 py-1.5 text-base rounded-md transition-colors ${
                    isActive
                      ? 'text-zinc-900 bg-zinc-100 font-medium'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon strokeWidth={1.5} className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Area */}
      <div className="p-3 border-t border-zinc-200 mt-auto shrink-0 relative">
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDropdownOpen(false)} 
            />
            <div className="absolute bottom-[calc(100%+4px)] left-3 right-3 px-1 bg-white border border-zinc-200 rounded-lg shadow-sm py-1 z-50 animate-in slide-in-from-bottom-2 duration-150">
              <button 
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                className="w-full cursor-pointer flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50/80 rounded-lg transition-colors text-left font-medium"
              >
                <LogOut strokeWidth={1.5} className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </>
        )}

        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full cursor-pointer flex items-center justify-between px-2 py-2 rounded-lg transition-colors hover:bg-zinc-50 ${isDropdownOpen ? 'bg-zinc-50' : ''}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-200/50 shadow-sm overflow-hidden">
              <span className="text-xs font-semibold text-zinc-600">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-zinc-900 truncate text-left">
              {user?.fullName || 'Utilisateur'}
            </span>
          </div>
          <MoreVertical strokeWidth={1.5} className="w-4 h-4 text-zinc-400 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
