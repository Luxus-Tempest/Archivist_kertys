import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'lightSolid' | 'danger';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  btnClass?: string;
  iconClass?: string;
}

export function Button({ 
  variant = 'solid', 
  icon, 
  iconPosition = 'right',
  className = '',
  btnClass = '',
  iconClass = '',
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = `w-full py-2 font-semibold transition-all duration-300 flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${btnClass}`;
  
  const variants = {
    solid:  'bg-linear-to-r from-primary to-primary-dim text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20',
    lightSolid: 'whitespace-nowrap bg-surface-container-highest text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors',
    outline: 'bg-transparent border border-outline-variant/30 text-on-surface rounded-xl hover:bg-surface-container-low transition-colors',
    ghost: 'bg-transparent text-primary hover:underline transition-all p-0 w-auto text-xs font-medium',
    danger: 'bg-error/10 text-error border border-error/20 rounded-full hover:bg-error hover:text-white transition-all font-bold text-xs'
  };

  const renderIcon = () => icon && (
    <span className={`${iconClass} ${iconPosition === 'right' ? 'group-hover:translate-x-1 transition-transform' : ''} flex items-center justify-center`}>
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
