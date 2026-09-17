import React from "react";

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  divided?: boolean;
  children: React.ReactNode;
}

export const List: React.FC<ListProps> = ({ divided = true, className = "", children, ...props }) => {
  return (
    <ul
      className={`rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${
        divided ? "divide-y divide-slate-200 dark:divide-slate-800" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </ul>
  );
};

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  active?: boolean;
  clickable?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  active = false,
  clickable = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <li
      className={`flex items-center justify-between p-4 text-sm text-slate-800 dark:text-slate-200 ${
        clickable ? "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60" : ""
      } ${active ? "bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium" : ""} ${className}`}
      {...props}
    >
      {children}
    </li>
  );
};
