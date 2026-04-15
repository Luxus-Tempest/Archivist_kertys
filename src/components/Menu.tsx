import { useEffect, useRef } from 'react';

export interface MenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  header?: string;
  className?: string;
}

/**
 * A reusable, premium dropdown menu component designed for the DocMe system.
 * It handles its own "click outside" logic and matches the design system aesthetics.
 */
export function Menu({ isOpen, onClose, items, header, className = '' }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      // Use a small timeout to avoid immediate closure if the trigger click is also a mousedown
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className={`absolute right-0 mt-3 w-64 bg-white rounded-md shadow-xs border border-slate-200 py-2 z-[100] transition-all origin-top-right ${className}`}
      style={{
        animation: 'menu-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes menu-appear {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {header && (
        <div className="px-6 py-2 border-b border-slate-300 mb-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {header}
          </h4>
        </div>
      )}
      
      <div className="py-0">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-6 py-2 text-left transition-all duration-200 group active:scale-[0.98] cursor-pointer ${
              item.variant === 'danger' 
                ? 'text-[#B05B56] hover:bg-red-50/50' 
                : 'text-[#44545C] hover:bg-gray-100'
            }`}
          >
            {item.icon && (
              <span className={`material-symbols-outlined text-[20px] transition-colors ${
                item.variant === 'danger' 
                  ? 'text-[#B05B56]/70 group-hover:text-[#B05B56]' 
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                {item.icon}
              </span>
            )}
            <span className="text-[15px] font-bold tracking-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
