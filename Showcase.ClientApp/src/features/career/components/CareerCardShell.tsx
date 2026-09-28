import React from "react";

export interface CareerCardShellProps {
  children: React.ReactNode;
  className?: string;
}

export const CareerCardShell: React.FC<CareerCardShellProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-card bg-ivory-light border border-stone/60 hover:border-slate-dark transition-colors shadow-none ${className}`.trim()}
    >
      {children}
    </div>
  );
};
