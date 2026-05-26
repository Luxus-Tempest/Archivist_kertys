import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserStatusEnum } from '../../types/auth';
import { Menu, type MenuItem } from '../Menu';
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '../LanguageSelector';
// import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { SvgIcon } from '../SvgIcon';

export function HeaderNew() {
  const { t } = useTranslation()
  const { user, logout, isLoading } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const statusStyles: Record<string, string> = {
    [UserStatusEnum.PENDING]: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    [UserStatusEnum.BLOCKED]: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const profileMenuItems: MenuItem[] = [
    {
      label: t('settings', 'Settings'),
      icon: <SettingsRoundedIcon sx={{ fontSize: 18 }} />,
      onClick: () => console.log('Settings clicked')
    },
    {
      label: t('logout', 'Logout'),
      icon: <LogoutRoundedIcon sx={{ fontSize: 18 }} />,
      onClick: () => logout(),
      variant: 'danger'
    },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-300 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <SvgIcon name='logo' width="100%" height="100%" className="w-32 h-10" />
        {/* <AccountBalanceWalletRoundedIcon className="text-slate-600" /> */}
        {/* <h1 className="text-xl font-bold tracking-tighter text-slate-800 font-headline">{t('DocPulseAI', 'DocPulseAI')}</h1> */}
      </div>

      {user?.status === UserStatusEnum.PENDING && (
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50/50 border border-amber-200/50 rounded-md animate-in fade-in zoom-in duration-700 mx-2">
          <PendingActionsRoundedIcon className="text-amber-600" sx={{ fontSize: 18 }} />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-tight whitespace-nowrap">
              {t('pendingApproval', 'Pending')}
            </span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-amber-300"></span>
            <span className="hidden md:inline text-[10px] text-amber-800 font-medium italic whitespace-nowrap">
              {t('pendingMessageHead', 'Under review')}
            </span>
          </div>
        </div>
      )}


      <div className="flex items-center gap-4 relative">
        <LanguageSelector />
        <div
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {user?.role === 'ADMIN' && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-widest border border-primary/20">
                  {t('role.admin', 'Admin')}
                </span>
              )}
              {!isLoading && user?.status && statusStyles[user.status] && (
                <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-widest border ${statusStyles[user.status]}`}>
                  {t(`userStatus.${user.status.toLowerCase()}`)}
                </span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-surface-container-highest overflow-hidden border border-outline-variant/20 active:scale-95 transition-transform duration-200 shadow-sm group-hover:border-primary/30">
            <img
              alt={t('userProfile', 'User profile')}
              src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random&bold=true`}
            />
          </div>
        </div>

        <Menu
          isOpen={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
          items={profileMenuItems}
          header={user?.email || t("account", "Account")}
          className="top-full mt-2"
        />
      </div>
    </header>
  );
}