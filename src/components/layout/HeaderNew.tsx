import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, type MenuItem } from '../Menu';
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '../LanguageSelector';

export function HeaderNew() {
  const { t } = useTranslation()
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuItems: MenuItem[] = [
    { 
      label: t('settings', 'Settings'), 
      icon: 'settings', 
      onClick: () => console.log('Settings clicked') 
    },
    { 
      label: t('logout', 'Logout'), 
      icon: 'logout', 
      onClick: () => logout(),
      variant: 'danger' 
    },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 border-b border-outline-variant/45 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-600">account_balance_wallet</span>
        <h1 className="text-xl font-bold tracking-tighter text-slate-800 font-headline">{t('docme', 'DocMe')}</h1>
      </div>
      
      <div className="flex items-center gap-4 relative">
        <LanguageSelector />
        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="w-8 h-8 rounded-md bg-surface-container-highest overflow-hidden border border-outline-variant/20 active:scale-95 transition-transform duration-200 cursor-pointer"
        >
          <img 
            alt={t('userProfile', 'User profile')} 
            src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`} 
          />
        </div>

        <Menu 
          isOpen={isProfileMenuOpen} 
          onClose={() => setIsProfileMenuOpen(false)} 
          items={profileMenuItems}
          header={t("account", "Account")}
          className="top-full"
        />
      </div>
    </header>
  );
}
