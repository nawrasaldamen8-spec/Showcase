import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'clay' | 'slate' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'slate',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-gothic font-medium uppercase tracking-[0.10em] select-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none rounded-[999px]';

    const variantClasses: Record<ButtonVariant, string> = {
      clay: 'bg-[#d97757] text-[#faf9f5] hover:bg-[#c8694a] active:bg-[#b75d3f]',
      slate: 'bg-[#141413] text-[#faf9f5] hover:bg-[#282725] active:bg-black',
      outline:
        'bg-transparent text-[#141413] border border-[#cccbc8] hover:border-[#141413] hover:bg-[#141413]/5 active:bg-[#141413]/10',
      ghost: 'bg-transparent text-[#141413] hover:bg-[#cccbc8]/25 active:bg-[#cccbc8]/40',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-4 py-1.5 text-[11px] gap-1.5',
      md: 'px-6 py-2.5 text-[13px] gap-2',
      lg: 'px-8 py-3.5 text-sm gap-2.5',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 leading-none">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0 leading-none">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
