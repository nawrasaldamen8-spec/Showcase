import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      fullWidth = true,
      id: customId,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(errorMessage);

    const borderClass = hasError
      ? 'border-[#d97757] focus:border-[#d97757]'
      : 'border-[#cccbc8] focus:border-[#141413]';

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} flex flex-col`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-label text-[#87867f] mb-1.5 cursor-pointer font-gothic text-[12px] font-semibold uppercase tracking-[0.10em]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#87867f]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`w-full bg-[#faf9f5] text-[#141413] text-body-sm font-serif border ${borderClass} rounded-lg px-3.5 py-2.5 outline-none transition-colors duration-150 placeholder:text-[#87867f]/70 placeholder:font-serif disabled:opacity-50 disabled:bg-[#f0eee6] disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${className}`.trim()}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#87867f]">
              {rightIcon}
            </div>
          )}
        </div>

        {hasError && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-[#d97757] font-gothic tracking-wide">
            {errorMessage}
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="mt-1 text-xs text-[#87867f] font-serif">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
