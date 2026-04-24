import { useState, createContext, useContext, useRef, useEffect, type ReactNode } from 'react';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

// --- Contexts ---

interface MenubarContextType {
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  variant: 'light' | 'dark';
}

const MenubarContext = createContext<MenubarContextType | undefined>(undefined);

interface MenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  id: string;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const SubmenuContext = createContext<{ isOpen: boolean; setIsOpen: (o: boolean) => void } | undefined>(undefined);

// --- Components ---

interface MenubarProps {
  children: ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * Top-level container for multiple menus.
 */
export function Menubar({ children, variant = 'light', className = '' }: MenubarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menubar-item]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  return (
    <MenubarContext.Provider value={{ openMenuId, setOpenMenuId, variant }}>
      <div className={`flex items-center gap-1 bg-surface border border-outline-variant/30 rounded-lg px-1 py-1 shadow-sm ${className}`}>
        {children}
      </div>
    </MenubarContext.Provider>
  );
}

interface MenuRootProps {
  children: ReactNode;
  id?: string;
}

/**
 * Root for a single menu hierarchy.
 */
export function MenuRoot({ children, id: providedId }: MenuRootProps) {
  const [isOpen, setIsOpen] = useState(false);
  const idRef = useRef(providedId || Math.random().toString(36).substring(2, 11));
  const menubar = useContext(MenubarContext);

  const effectiveOpen = menubar ? menubar.openMenuId === idRef.current : isOpen;
  
  const handleSetOpen = (open: boolean) => {
    if (menubar) {
      menubar.setOpenMenuId(open ? idRef.current : null);
    } else {
      setIsOpen(open);
    }
  };

  return (
    <MenuContext.Provider value={{ isOpen: effectiveOpen, setIsOpen: handleSetOpen, id: idRef.current }}>
      <div className="relative inline-block">
        {children}
      </div>
    </MenuContext.Provider>
  );
}

interface MenuTriggerProps {
  children: ReactNode;
  className?: string;
}

/**
 * The button that triggers the menu.
 */
export function MenuTrigger({ children, className = '' }: MenuTriggerProps) {
  const { isOpen, setIsOpen } = useContext(MenuContext)!;
  const menubar = useContext(MenubarContext);

  const handleMouseEnter = () => {
    if (menubar?.openMenuId) {
      setIsOpen(true);
    }
  };

  return (
    <button
      data-menubar-item
      onMouseEnter={handleMouseEnter}
      onClick={() => setIsOpen(!isOpen)}
      className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all duration-200 active:scale-95 ${
        isOpen 
          ? 'bg-primary/10 text-primary' 
          : 'text-slate-600 hover:bg-slate-100'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Handles portal rendering (simplified).
 */
export function MenuPortal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

interface MenuPositionerProps {
  children: ReactNode;
  sideOffset?: number;
  alignOffset?: number;
}

/**
 * Positioning logic for both top-level menus and submenus.
 */
export function MenuPositioner({ children, sideOffset = 4, alignOffset = 0 }: MenuPositionerProps) {
  const menuContext = useContext(MenuContext);
  const submenuContext = useContext(SubmenuContext);
  
  // Use submenu state if in a submenu context, otherwise use regular menu state
  const isOpen = submenuContext ? submenuContext.isOpen : menuContext?.isOpen;

  if (!isOpen) return null;

  // If we are in a submenu, position to the right. Otherwise position below.
  const style = submenuContext 
    ? { top: -6 + alignOffset, left: `calc(100% + ${sideOffset}px)` }
    : { top: `calc(100% + ${sideOffset}px)`, left: alignOffset };

  return (
    <div className="absolute z-50" style={style}>
      {children}
    </div>
  );
}

interface MenuPopupProps {
  children: ReactNode;
  className?: string;
}

/**
 * The actual menu container with styles and animations.
 */
export function MenuPopup({ children, className = '' }: MenuPopupProps) {
  const menubar = useContext(MenubarContext);
  const isDark = menubar?.variant === 'dark';

  const bgClasses = isDark 
    ? 'bg-slate-900/95 backdrop-blur-md border-white/10 shadow-2xl' 
    : 'bg-white border-slate-200 shadow-xl';

  return (
    <div 
      className={`min-w-[200px] border rounded-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${bgClasses} ${className}`}
    >
      {children}
    </div>
  );
}

interface MenuItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Individual interactive menu item.
 */
export function MenuItem({ children, icon, onClick, className = '' }: MenuItemProps) {
  const menu = useContext(MenuContext)!;
  const menubar = useContext(MenubarContext);
  const isDark = menubar?.variant === 'dark';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        menu.setIsOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all group active:scale-[0.98] ${
        isDark 
          ? 'text-white/80 hover:bg-white/10 hover:text-white' 
          : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
      } ${className}`}
    >
      {icon && (
        <span className={`transition-colors shrink-0 ${
          isDark ? 'text-white/40 group-hover:text-white' : 'text-slate-400 group-hover:text-primary'
        }`}>
          {icon}
        </span>
      )}
      <span className="text-[12px] font-bold tracking-tight">
        {children}
      </span>
    </button>
  );
}

/**
 * Simple divider.
 */
export function MenuSeparator() {
  const menubar = useContext(MenubarContext);
  const isDark = menubar?.variant === 'dark';
  return <div className={`h-px my-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />;
}

/**
 * Group container.
 */
export function MenuGroup({ children }: { children: ReactNode }) {
  return <div className="py-1">{children}</div>;
}

/**
 * Labeled section header.
 */
export function MenuGroupLabel({ children }: { children: ReactNode }) {
  const menubar = useContext(MenubarContext);
  const isDark = menubar?.variant === 'dark';
  return (
    <div className={`px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
      {children}
    </div>
  );
}

// --- Nesting ---

/**
 * Root for a nested submenu.
 */
export function MenuSubmenuRoot({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <SubmenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div 
        className="relative" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </SubmenuContext.Provider>
  );
}

/**
 * The item that triggers a submenu on hover/click.
 */
export function MenuSubmenuTrigger({ children, icon, className = '' }: MenuItemProps) {
  const context = useContext(SubmenuContext);
  const menubar = useContext(MenubarContext);
  const isDark = menubar?.variant === 'dark';

  if (!context) return null;
  const { isOpen } = context;

  return (
    <div
      className={`w-full flex items-center justify-between px-4 py-2 transition-all cursor-default ${
        isOpen
          ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-50 text-primary')
          : (isDark ? 'text-white/80 hover:bg-white/10 shadow-sm' : 'text-slate-700 hover:bg-slate-50')
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className={`transition-colors shrink-0 ${
            isDark ? 'text-white/40 group-hover:text-white' : 'text-slate-400 group-hover:text-primary'
          }`}>
            {icon}
          </span>
        )}
        <span className="text-[12px] font-bold tracking-tight">{children}</span>
      </div>
      <ChevronRightRoundedIcon className="opacity-40" sx={{ fontSize: 16 }} />
    </div>
  );
}
