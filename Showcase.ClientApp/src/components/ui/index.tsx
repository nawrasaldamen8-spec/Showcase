import React, { ReactNode } from 'react';

// --- Layout Primitives ---

export function PageContainer({ children, className = '' }: { children: ReactNode, className?: string }) {
    return <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>{children}</div>;
}

export function PageHeader({ title, description, actions }: { title: string, description?: string, actions?: ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-200 mb-8">
            <div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900">{title}</h1>
                {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
            </div>
            {actions && <div className="mt-4 sm:mt-0 flex gap-3">{actions}</div>}
        </div>
    );
}

export function Grid({ children, className = '' }: { children: ReactNode, className?: string }) {
    return <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>{children}</div>;
}

export function Stack({ children, className = '', space = 'space-y-4' }: { children: ReactNode, className?: string, space?: string }) {
    return <div className={`flex flex-col ${space} ${className}`}>{children}</div>;
}

export function Divider({ className = '' }: { className?: string }) {
    return <hr className={`border-gray-200 ${className}`} />;
}

// --- Data Display ---

export function Card({ children, className = '' }: { children: ReactNode, className?: string }) {
    return <div className={`bg-white overflow-hidden shadow rounded-lg border border-gray-100 ${className}`}>{children}</div>;
}

export function Avatar({ src, alt, initials, className = '' }: { src?: string, alt?: string, initials?: string, className?: string }) {
    return (
        <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500 overflow-hidden ${className}`}>
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <span className="text-sm font-medium leading-none text-white">{initials}</span>
            )}
        </span>
    );
}

export function Badge({ children, variant = 'default', className = '' }: { children: ReactNode, variant?: 'default' | 'success' | 'primary' | 'danger', className?: string }) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        primary: 'bg-blue-100 text-blue-800',
        danger: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

export function DescriptionList({ items, className = '' }: { items: { label: string, value: ReactNode }[], className?: string }) {
    return (
        <dl className={`divide-y divide-gray-100 ${className}`}>
            {items.map((item, idx) => (
                <div key={idx} className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function Image({ src, alt, className = '' }: { src: string, alt: string, className?: string }) {
    return <img src={src} alt={alt} className={`rounded-lg object-cover ${className}`} />;
}

export function DataTable({ columns, data, className = '' }: { columns: string[], data: ReactNode[][], className?: string }) {
    return (
        <div className={`overflow-x-auto border border-gray-200 sm:rounded-lg ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void, className?: string }) {
    return (
        <div className={`flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 ${className}`}>
            <div className="flex flex-1 justify-between sm:hidden">
                <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
                <Button variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div><p className="text-sm text-gray-700">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span></p></div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button variant="outline" className="rounded-l-md rounded-r-none" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
                        <Button variant="outline" className="rounded-l-none rounded-r-md" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

// --- Form Controls ---

export function Button({ children, variant = 'primary', className = '', ...props }: any) {
    const base = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer";
    const variants: Record<string, string> = {
        primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
        ghost: "border-transparent text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500 shadow-none",
        danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };
    return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function IconButton({ icon, variant = 'ghost', className = '', ...props }: any) {
    const base = "inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer";
    const variants: Record<string, string> = {
        primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
        ghost: "text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
        danger: "text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500",
    };
    return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{icon}</button>;
}

export function Form({ children, className = '', onSubmit }: { children: ReactNode, className?: string, onSubmit?: (e: React.FormEvent) => void }) {
    return <form className={`space-y-6 ${className}`} onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }}>{children}</form>;
}

export function Input({ label, type = 'text', id, className = '', ...props }: any) {
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input type={type} id={id} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" {...props} />
        </div>
    );
}

export function Textarea({ label, id, rows = 3, className = '', ...props }: any) {
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <textarea id={id} rows={rows} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" {...props} />
        </div>
    );
}

export function Select({ label, id, options, className = '', ...props }: any) {
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <select id={id} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 bg-white" {...props}>
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export function Switch({ label, id, checked, onChange, className = '' }: any) {
    return (
        <div className={`flex items-center ${className}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
                <span aria-hidden="true" className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
            {label && <label htmlFor={id} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer" onClick={() => onChange(!checked)}>{label}</label>}
        </div>
    );
}

// --- Feedback & Modals ---

export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;
}

export function EmptyState({ title, description, action, className = '' }: { title: string, description: string, action?: ReactNode, className?: string }) {
    return (
        <div className={`text-center p-12 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{message}</p>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button variant="danger" onClick={onConfirm} className="w-full sm:w-auto">Confirm</Button>
                    <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto mt-3 sm:mt-0">Cancel</Button>
                </div>
            </div>
        </div>
    );
}

export function Toast({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) {
    return (
        <div className={`fixed bottom-4 right-4 z-50 rounded-md p-4 shadow-lg flex items-center justify-between min-w-[300px] ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className={type === 'success' ? 'text-green-500' : 'text-red-500'}>
                        {type === 'success' ? '✓' : '⚠'}
                    </span>
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
                </div>
            </div>
            <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                    <IconButton icon="✕" variant="ghost" onClick={onClose} className={type === 'success' ? 'text-green-600 hover:bg-green-200' : 'text-red-600 hover:bg-red-200'} />
                </div>
            </div>
        </div>
    );
}
