import React from "react";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ onSubmit, className = "space-y-4", children, ...props }) => {
  return (
    <form onSubmit={onSubmit} className={className} noValidate {...props}>
      {children}
    </form>
  );
};

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = "flex flex-col gap-1.5" }) => {
  return <div className={className}>{children}</div>;
};

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, required, className = "", ...props }) => {
  return (
    <label className={`text-xs font-semibold text-slate-700 dark:text-slate-200 ${className}`} {...props}>
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );
};

export interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const FormDescription: React.FC<FormDescriptionProps> = ({ children, className = "" }) => {
  return <p className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}>{children}</p>;
};

export interface FormErrorProps {
  error?: string | null;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error, className = "" }) => {
  if (!error) return null;
  return (
    <p className={`flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium ${className}`}>
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {error}
    </p>
  );
};
