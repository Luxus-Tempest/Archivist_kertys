import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  icon?: ReactNode;
  error?: string;
  rightElement?: ReactNode;
  inputClassName?: string;
  options?: SelectOption[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      icon,
      className = '',
      error,
      rightElement,
      inputClassName = '',
      options,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`group ${className} text-xs`}>
        <label
          htmlFor={id}
          className="block font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-4 text-outline text-lg pointer-events-none flex items-center justify-center">
              {icon}
            </span>
          )}

          <select
            id={id}
            ref={ref}
            className={`w-full appearance-none ${
              icon ? 'pl-12' : 'pl-4'
            } pr-10 py-3 bg-surface-container-low border-0 rounded-xl focus:ring-1 focus:ring-primary transition-all font-body text-on-surface ${
              error ? 'ring-1 ring-error' : ''
            } ${inputClassName}`}
            {...props}
          >
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={`w-full text-left text-xs px-4 py-2 hover:bg-surface-container-high transition-colors ${props.value === option.value
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface'
                      }`}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>

          {rightElement ? (
            <div className="absolute right-4 flex items-center">
              {rightElement}
            </div>
          ) : (
            <span className="absolute right-4 pointer-events-none text-outline">
              ▼
            </span>
          )}
        </div>

        {error && <p className="text-xs text-error mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';