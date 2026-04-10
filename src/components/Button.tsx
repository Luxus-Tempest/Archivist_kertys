import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export function Button({ 
  variant = 'solid', 
  icon, 
  iconPosition = 'right',
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = "w-full py-4 font-semibold transition-all duration-300 flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-linear-to-r from-primary to-primary-dim text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20",
    outline: "bg-transparent border border-outline-variant/30 text-on-surface rounded-xl hover:bg-surface-container-low transition-colors",
    ghost: "bg-transparent text-primary hover:underline transition-all p-0 w-auto text-xs font-medium"
  };

  const renderIcon = () => icon && (
    <span className={`material-symbols-outlined text-lg ${iconPosition === 'right' ? 'group-hover:translate-x-1 transition-transform' : ''}`}>
      {icon}
    </span>
  );

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} group`}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
}
