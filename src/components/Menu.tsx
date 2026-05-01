import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next'

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  header?: string;
  className?: string;
  variant?: 'light' | 'dark';
  align?: 'left' | 'right';
}

/**
 * A reusable, premium dropdown menu component designed for the DocMe system.
 * It handles its own "click outside" logic and matches the design system aesthetics.
 */
export function Menu({ 
  isOpen, 
  onClose, 
  items, 
  header, 
  className = '', 
  variant = 'light',
  align = 'right' 
}: MenuProps) {
  const { t } = useTranslation()
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

  const isDark = variant === 'dark';
  const alignmentClass = align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left';
  
  const bgClass = isDark ? t('bgslate90095BackdropblurmdBorderwhite15Shadow2xl', 'bg-slate-900/95 backdrop-blur-md border-white/15 shadow-2xl') : t('bgwhiteBorderslate200Shadowxs', 'bg-white border-slate-200 shadow-xs');
  const headerTextClass = isDark ? 'text-white/40' : 'text-slate-400';
  const headerBorderClass = isDark ? 'border-white/10' : 'border-slate-300';

  return (
    <div 
      ref={menuRef}
      className={`absolute ${alignmentClass} mt-3 w-56 rounded-xl border py-2 z-50 transition-all ${bgClass} ${className} shadow-md`}
      style={{
        animation: 'menu-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{t('keyframesMenuappearFromOpacity0TransformScale095Translatey10pxToOpacity1TransformScale1Translatey0', '@keyframes menu-appear {\n          from { opacity: 0; transform: scale(0.95) translateY(-10px); }\n          to { opacity: 1; transform: scale(1) translateY(0); }\n        }')}</style>

      {header && (
        <div className={`px-6 py-2 border-b ${headerBorderClass} mb-1`}>
          <h4 className={`text-[10px] font-black capitalize tracking-[0.2em] ${headerTextClass}`}>
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
            className={`w-full flex items-center gap-2 px-6 py-2.5 text-left transition-all duration-200 group active:scale-[0.98] cursor-pointer ${
              item.variant === 'danger' 
                ? 'text-[#B05B56] hover:bg-red-50/50' 
                : isDark 
                  ? 'text-white/80 hover:bg-white/10 hover:text-white'
                  : 'text-[#44545C] hover:bg-gray-100'
            }`}
          >
            {item.icon && (
              <span className={`text-[18px] transition-colors flex items-center justify-center ${
                item.variant === 'danger' 
                  ? 'text-[#B05B56]/70 group-hover:text-[#B05B56]' 
                  : isDark
                    ? 'text-white/40 group-hover:text-white'
                    : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                {item.icon}
              </span>
            )}
            <span className="text-[12px] font-black tracking-widest capitalize">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

