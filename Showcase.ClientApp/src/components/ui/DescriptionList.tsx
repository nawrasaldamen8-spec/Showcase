import React from "react";

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  children: React.ReactNode;
  variant?: "horizontal" | "vertical";
}

export const DescriptionList: React.FC<DescriptionListProps> = ({
  variant = "horizontal",
  className = "",
  children,
  ...props
}) => {
  return (
    <dl
      className={`divide-y divide-slate-100 dark:divide-slate-800 ${
        variant === "vertical" ? "space-y-3" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </dl>
  );
};

export interface DescriptionItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

export const DescriptionItem: React.FC<DescriptionItemProps> = ({ label, value, className = "" }) => {
  return (
    <div className={`py-3 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 sm:col-span-2 sm:mt-0 font-medium">{value}</dd>
    </div>
  );
};
