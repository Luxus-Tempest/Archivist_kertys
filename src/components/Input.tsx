import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  id: string;
  error?: string;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, icon, className = '', error, rightElement, ...props }, ref) => {
    return (
      <div className={`group ${className}`}>
        <label 
          htmlFor={id} 
          className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-4 material-symbols-outlined text-outline text-lg pointer-events-none">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-surface-container-low border-0 rounded-xl focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant font-body text-on-surface ${
              error ? 'ring-1 ring-error' : ''
            }`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
