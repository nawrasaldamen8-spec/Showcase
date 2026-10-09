import React from 'react';
import { X } from 'lucide-react';

export type BadgeVariant = 'slate' | 'clay' | 'stone' | 'amber';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const baseClasses =
  'inline-flex items-center justify-center font-gothic font-semibold uppercase tracking-[0.10em] rounded-pill select-none transition-colors duration-150 leading-none';

const variantClasses: Record<BadgeVariant, string> = {
  slate: 'bg-slate-dark text-ivory-light',
  clay: 'bg-clay text-ivory-light',
  stone: 'bg-stone/30 text-slate-dark border border-stone',
  amber: 'bg-amber text-slate-dark',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-[10px] gap-1',
  md: 'px-3.5 py-1.5 text-[11px] gap-1.5',
};

const dotClasses: Record<BadgeVariant, string> = {
  slate: 'bg-ivory-light',
  clay: 'bg-ivory-light',
  stone: 'bg-slate-dark',
  amber: 'bg-slate-dark',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'stone',
  size = 'md',
  dot = false,
  icon,
  onRemove,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClasses[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 active:bg-black/20 focus:outline-none transition-colors cursor-pointer"
          aria-label="Remove badge"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};
