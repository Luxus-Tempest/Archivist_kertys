import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

import { SvgIcon, type IconName } from '../SvgIcon';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { UserRoleEnum } from '../../types/auth';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface NavItem {
  name: string;
  icon: IconName;
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
  const isAllowed = user?.role === UserRoleEnum.OWNER || user?.role === UserRoleEnum.ADMIN;

  const navGroups: NavGroup[] = [
    {
      label: t('sidebar.groups.core', 'Core'),
      items: [
        { name: t('sidebar.explorer', 'Explorer'), icon: 'explorer', path: '/explorer' },
        { name: t('sidebar.history', 'History'), icon: 'history', path: '/history' },
        { name: t('sidebar.process', 'Process'), icon: 'upload', path: '/process' },
      ],
    },
    {
      label: t('sidebar.groups.admin', 'Admin'),
      adminOnly: true,
      items: [
        { name: t('sidebar.members', 'Members'), icon: 'members', path: '/members' },
        { name: t('sidebar.instructions', 'Instructions'), icon: 'folderOpen', path: '/instructions' },
      ],
    },
    {
      label: t('sidebar.groups.settings', 'Settings'),
      items: [
        {
          name: t('sidebar.organizations'),
          icon: 'organizations',
          path: '/organizations',
          disabled: true,
          message: t('sidebar.comingSoon', 'Coming soon'),
        },
      ],
    },
  ];

  const visibleGroups = navGroups.filter(g => !g.adminOnly || isAllowed);

  return (
    <aside
      className={`
        hidden md:flex flex-col p-3
        border-r border-surface-container
        h-[calc(100vh-80px)]
        fixed left-0
        bg-cipher-bg
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
                <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-on-surface-variant/70 select-none">
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
                            ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                            py-2.5 rounded-lg transition-all duration-200

                            ${
                              isDisabled
                                ? 'opacity-40 cursor-not-allowed text-outline'
                                : isActive
                                  ? `
                                      bg-primary text-on-primary
                                      shadow-sm
                                      font-bold
                                      ${isCollapsed ? 'shadow-md' : ''}
                                    `
                                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                            }
                          `
                        }
                      >
                        <SvgIcon
                          name={item.icon}
                          className="flex-shrink-0 transition-all duration-300"
                          width={isCollapsed ? 24 : 18}
                          height={isCollapsed ? 24 : 18}
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

                              bg-on-surface/95 backdrop-blur-xl
                              text-surface text-[11px] font-medium

                              rounded-md
                              border border-outline-variant/30

                              shadow-[0_10px_40px_rgba(0,0,0,0.4)]

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
                                bg-on-surface/95
                                border-l border-t border-outline-variant/30
                              "
                            />
                          </div>
                        )}

                        {/* DISABLED BADGE */}
                        {isDisabled && !isCollapsed && (
                          <span className="ml-auto text-[9px] italic tracking-wider text-outline/60 font-bold">
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
          w-4 h-14 bg-cipher-bg
          border-y border-r border-surface-container
          rounded-r-xl flex items-center justify-center
          cursor-pointer text-outline hover:text-primary
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