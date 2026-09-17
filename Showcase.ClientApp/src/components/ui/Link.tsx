import React from "react";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "muted" | "subtle";
  isExternal?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  variant = "primary",
  isExternal = false,
  className = "",
  children,
  href,
  target,
  rel,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    primary:
      "text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 font-medium",
    muted: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors",
    subtle: "text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
  };

  const externalProps = isExternal
    ? {
        target: target || "_blank",
        rel: rel || "noopener noreferrer",
      }
    : { target, rel };

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 text-sm ${variantStyles[variant]} ${className}`}
      {...externalProps}
      {...props}
    >
      {children}
      {isExternal && (
        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </a>
  );
};
