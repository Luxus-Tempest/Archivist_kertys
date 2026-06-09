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
        border-r border-gray-300
        h-[calc(100vh-80px)]
        fixed left-0
        bg-white
        font-body text-sm font-medium
        transition-all duration-300 ease-in-out
        z-40
        group/sidebar
        ${isCollapsed ? 'w-16 overflow-visible' : 'w-64'}
      `}
    >
      <div className={`flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        <nav className="flex flex-col gap-5 pt-3">

          {visibleGroups.map((group, gi) => (
            <div key={group.label}>

              <div className="min-h-[28px] flex flex-col justify-end">
                <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-on-surface-variant/70 select-none whitespace-nowrap">
                    {group.label}
                  </p>
                </div>
              </div>

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
                            relative flex items-center gap-3 px-3
                            py-2.5 rounded-md transition-all duration-200

                            ${isDisabled
                            ? 'opacity-40 cursor-not-allowed text-outline'
                            : isActive
                              ? `
                                      bg-blue-thin text-blue-dark
                                      font-bold
                                    `
                              : 'text-on-surface-variant hover:bg-hover-gray-100 hover:text-inherit'
                          }
                          `
                        }
                      >
                        <SvgIcon
                          name={item.icon}
                          className="flex-shrink-0 transition-all duration-300"
                          width={20}
                          height={20}
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
        // className="
        //   absolute -right-3.5 top-4
        //   w-7 h-7 rounded-full bg-white
        //   border border-gray-300 shadow-sm
        //   flex items-center justify-center
        //   cursor-pointer text-on-surface-variant hover:text-blue-dark hover:border-blue-300 hover:shadow-md
        //   transition-all duration-300 z-50
        // "
        className="
          opacity-0
          group-hover/sidebar:opacity-100
          absolute right-1.5 top-4
          cursor-pointer hover:text-blue-dark hover:border-blue-300
          transition-all duration-300 z-50
        "
      >
        <SvgIcon 
          name={isCollapsed ? "open" : "collapse"} 
          className="" 
          width={30} 
          height={25} 
        />
      </button>
    </aside>
  );
}