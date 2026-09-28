import React from "react";

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  headerClassName?: string;
  className?: string;
}

export interface AdminTableProps<T extends { id: string }> {
  columns: AdminTableColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
}

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  isLoading = false,
  loadingMessage = "Loading records...",
  emptyMessage = "No records matching search query.",
}: AdminTableProps<T>): React.ReactElement {
  return (
    <div className="bg-ivory-light rounded-2xl border border-stone overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-serif text-xs">
          <thead>
            <tr className="border-b border-stone bg-ivory-medium font-gothic text-[10px] font-bold uppercase tracking-[0.14em] text-cloud-dark">
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 ${col.headerClassName || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/60">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-cloud-dark">
                  {loadingMessage}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-cloud-dark">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-ivory-medium/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 ${col.className || ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
