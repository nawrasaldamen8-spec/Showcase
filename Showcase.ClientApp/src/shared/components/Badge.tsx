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
  const baseClasses =
    'inline-flex items-center justify-center font-gothic font-semibold uppercase tracking-[0.10em] rounded-[999px] select-none transition-colors duration-150 leading-none';

  const variantClasses: Record<BadgeVariant, string> = {
    slate: 'bg-[#141413] text-[#faf9f5]',
    clay: 'bg-[#d97757] text-[#faf9f5]',
    stone: 'bg-[#cccbc8]/30 text-[#141413] border border-[#cccbc8]',
    amber: 'bg-[#f1a900] text-[#141413]',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2.5 py-1 text-[10px] gap-1',
    md: 'px-3.5 py-1.5 text-[11px] gap-1.5',
  };

  const dotClasses: Record<BadgeVariant, string> = {
    slate: 'bg-[#faf9f5]',
    clay: 'bg-[#faf9f5]',
    stone: 'bg-[#141413]',
    amber: 'bg-[#141413]',
  };

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
