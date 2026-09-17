import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <thead
      className={`border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-slate-200 dark:divide-slate-800 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <tr className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <th
      className={`h-10 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <td className={`p-4 align-middle text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
};
