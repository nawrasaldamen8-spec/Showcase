import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  circular: 'rounded-full shrink-0',
  rectangular: 'rounded-lg w-full',
  card: 'rounded-card w-full border border-stone/40',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const styleOverrides: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#e6e3da] ${variantClasses[variant]} ${className}`.trim()}
      style={styleOverrides}
      {...props}
    />
  );
};
