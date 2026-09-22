import React, { forwardRef, useId, useEffect, useRef, useCallback } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showCount?: boolean;
  autoResize?: boolean;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      showCount = false,
      autoResize = false,
      fullWidth = true,
      id: customId,
      disabled,
      maxLength,
      value,
      defaultValue,
      onChange,
      rows = 4,
      className = '',
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;

    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    // Synchronize forwarded ref and internal ref
    const setRefs = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    };

    // Calculate current character count
    const currentLength = typeof value === 'string'
      ? value.length
      : typeof defaultValue === 'string'
      ? defaultValue.length
      : internalRef.current?.value.length || 0;

    const adjustHeight = useCallback(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    const hasError = Boolean(errorMessage);
    const borderClass = hasError
      ? 'border-[#d97757] focus:border-[#d97757]'
      : 'border-[#cccbc8] focus:border-[#141413]';

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} flex flex-col`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-label text-[#87867f] mb-1.5 cursor-pointer font-gothic text-[12px] font-semibold uppercase tracking-[0.10em]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={setRefs}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={`w-full bg-[#faf9f5] text-[#141413] text-body-sm font-serif border ${borderClass} rounded-lg p-3.5 outline-none transition-colors duration-150 resize-y placeholder:text-[#87867f]/70 placeholder:font-serif disabled:opacity-50 disabled:bg-[#f0eee6] disabled:cursor-not-allowed ${
            autoResize ? 'resize-none overflow-hidden' : ''
          } ${className}`.trim()}
          {...props}
        />

        <div className="flex items-center justify-between mt-1 text-xs">
          <div>
            {hasError && (
              <p id={errorId} role="alert" className="text-[#d97757] font-gothic tracking-wide">
                {errorMessage}
              </p>
            )}
            {!hasError && helperText && (
              <p id={helperId} className="text-[#87867f] font-serif">
                {helperText}
              </p>
            )}
          </div>

          {showCount && (
            <span
              className={`font-gothic text-[11px] uppercase tracking-wider ml-auto select-none ${
                maxLength && currentLength >= maxLength
                  ? 'text-[#d97757] font-semibold'
                  : 'text-[#87867f]'
              }`}
            >
              {currentLength}
              {maxLength ? ` / ${maxLength}` : ''}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
