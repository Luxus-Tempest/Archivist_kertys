import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
  disabled?: boolean;
  message?: string;
}

interface NavGroup {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
}

export function SidebarNew({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navGroups: NavGroup[] = [
    {
      label: t('sidebar.groups.core', 'Core'),
      items: [
        { name: t('sidebar.explorer', 'Explorer'), icon: FolderRoundedIcon, path: '/explorer' },
        { name: t('sidebar.history', 'History'), icon: HistoryRoundedIcon, path: '/history' },
        { name: t('sidebar.process', 'Process'), icon: AddRoundedIcon, path: '/process' },
      ],
    },
    {
      label: t('sidebar.groups.admin', 'Admin'),
      adminOnly: true,
      items: [
        { name: t('sidebar.members', 'Members'), icon: ManageAccountsRoundedIcon, path: '/members' },
        { name: t('sidebar.instructions', 'Instructions'), icon: ManageAccountsRoundedIcon, path: '/instructions' },
      ],
    },
    {
      label: t('sidebar.groups.settings', 'Settings'),
      items: [
        {
          name: t('sidebar.organizations', 'Organizations'),
          icon: CorporateFareRoundedIcon,
          path: '/organizations',
          disabled: true,
          message: t('sidebar.comingSoon', 'Coming soon'),
        },
      ],
    },
  ];

  const visibleGroups = navGroups.filter(g => !g.adminOnly || isAdmin);

  return (
    <aside
      className={`
        hidden md:flex flex-col p-3
        border-r border-outline-variant/45
        h-[calc(100vh-80px)]
        fixed left-0
        bg-surface
        font-body text-sm font-medium
        transition-all duration-300 ease-in-out
        z-40
        ${isCollapsed ? 'w-16 overflow-visible' : 'w-64'}
      `}
    >
      <div className={`flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        <nav className="flex flex-col gap-5">

          {visibleGroups.map((group, gi) => (
            <div key={group.label}>

              {!isCollapsed && (
                <p className="px-2 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 select-none">
                  {group.label}
                </p>
              )}

              {isCollapsed && gi !== 0 && (
                <div className="mx-auto w-6 h-px bg-outline-variant/40 mb-2" />
              )}

              <div className="flex flex-col gap-1">

                {group.items.map((item) => {
                  const isDisabled = item.disabled;

                  return (
                    <div key={item.path + item.name} className="relative group">

                      <NavLink
                        to={isDisabled ? '#' : item.path}
                        onClick={(e) => {
                          if (isDisabled) e.preventDefault();
                        }}
                        className={({ isActive }) =>
                          `
                            relative flex items-center
                            ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}
                            py-3 rounded-md transition-all duration-200

                            ${
                              isDisabled
                                ? 'opacity-40 cursor-not-allowed text-slate-400'
                                : isActive
                                  ? `
                                      text-slate-900
                                      ${isCollapsed ? 'bg-white' : 'bg-gradient-to-r from-white to-slate-50/65'}
                                      ${isCollapsed ? 'border border-outline-variant/20' : 'border border-slate-100/70'}
                                      font-semibold
                                      relative
                                      before:content-['']
                                      before:absolute
                                      before:left-0
                                      before:top-1/2
                                      before:-translate-y-1/2
                                      before:${isCollapsed ? 'w-1' : 'w-1.5'}
                                      before:bg-slate-900/90
                                      before:h-full
                                      before:rounded-none
                                    `
                                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/70'
                            }
                          `
                        }
                      >
                        <item.icon
                          className={`flex-shrink-0 transition-all duration-300 ${
                            isCollapsed ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-700'
                          }`}
                          sx={{ fontSize: isCollapsed ? 24 : 18 }}
                        />

                        {!isCollapsed && (
                          <span className="truncate text-[13.5px]">
                            {item.name}
                          </span>
                        )}

                        {/* TOOLTIP PREMIUM DARK */}
                        {isCollapsed && (
                          <div
                            className="
                              absolute left-full top-1/2 -translate-y-1/2 ml-3
                              px-3 py-3

                              bg-slate-900/95 backdrop-blur-xl
                              text-slate-100 text-[11px] font-medium

                              rounded-md
                              border border-slate-700/60

                              shadow-[0_10px_40px_rgba(0,0,0,0.6)]

                              whitespace-nowrap

                              opacity-0 scale-95 translate-x-2
                              pointer-events-none

                              group-hover:opacity-100
                              group-hover:scale-100
                              group-hover:translate-x-0

                              transition-all duration-200 ease-out

                              z-50
                            "
                          >
                            {item.name}

                            <div
                              className="
                                absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2
                                w-2.5 h-2.5 rotate-45
                                bg-slate-900/95
                                border-l border-t border-slate-700/60
                              "
                            />
                          </div>
                        )}

                        {/* DISABLED BADGE */}
                        {isDisabled && !isCollapsed && (
                          <span className="ml-auto text-[9px] italic tracking-wider text-slate-400 font-bold">
                            {item.message}
                          </span>
                        )}
                      </NavLink>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -right-[17px] top-1/2 -translate-y-1/2
          w-4 h-14 bg-surface
          border-y border-r border-outline-variant/45
          rounded-r-xl flex items-center justify-center
          cursor-pointer text-slate-400 hover:text-slate-900
          transition-all z-50
          hover:w-5 hover:-right-[21px]
        "
      >
        {isCollapsed ? (
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        ) : (
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
        )}
      </button>
    </aside>
  );
}