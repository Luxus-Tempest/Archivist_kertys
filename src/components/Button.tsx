import { type ButtonHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'lightSolid';
  icon?: string;
  iconPosition?: 'left' | 'right';
  btnClass?: string;
}

export function Button({ 
  variant = 'solid', 
  icon, 
  iconPosition = 'right',
  className = '',
  btnClass = '',
  children, 
  ...props 
}: ButtonProps) {
  const { t } = useTranslation()
  const baseStyles = t('wfullPy4FontsemiboldTransitionallDuration300FlexJustifycenterItemscenterGap2Activescale098Disabledopacity70Disabledcursornotallowed', `w-full py-2 font-semibold transition-all duration-300 flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${btnClass}`);
  
  const variants = {
    solid: t('bglineartorFromprimaryToprimarydimTextonprimaryRoundedfullHovershadowlgHovershadowprimary20', 'bg-linear-to-r from-primary to-primary-dim text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20'),
    lightSolid: t('bglineartorFromprimaryToprimarydimTextonprimaryRoundedfullHovershadowlgHovershadowprimary20', 'whitespace-nowrap bg-surface-container-highest text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors'),
    outline: t('bgtransparentBorderBorderoutlinevariant30TextonsurfaceRoundedxlHoverbgsurfacecontainerlowTransitioncolors', 'bg-transparent border border-outline-variant/30 text-on-surface rounded-xl hover:bg-surface-container-low transition-colors'),
    ghost: t('bgtransparentTextprimaryHoverunderlineTransitionallP0WautoTextxsFontmedium', 'bg-transparent text-primary hover:underline transition-all p-0 w-auto text-xs font-medium')
  };

  const renderIcon = () => icon && (
    <span className={`material-symbols-outlined text-lg ${iconPosition === 'right' ? 'group-hover:translate-x-1 transition-transform' : ''}`}>
      {icon}
    </span>
  );

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} group cursor-pointer`}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
}
