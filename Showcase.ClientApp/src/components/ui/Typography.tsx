import React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level = 1, className = "", children, ...props }) => {
  const styles: Record<number, string> = {
    1: "text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white",
    2: "text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white",
    3: "text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white",
    4: "text-lg sm:text-xl font-semibold text-slate-900 dark:text-white",
    5: "text-base font-medium text-slate-900 dark:text-white",
    6: "text-sm font-medium text-slate-700 dark:text-slate-300",
  };

  const Component = `h${level}` as React.ElementType;

  return (
    <Component className={`${styles[level]} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "body" | "lead" | "muted" | "small" | "code";
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({ variant = "body", className = "", children, ...props }) => {
  const styles: Record<string, string> = {
    body: "text-base text-slate-700 dark:text-slate-300 leading-relaxed",
    lead: "text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed",
    muted: "text-sm text-slate-500 dark:text-slate-400",
    small: "text-xs text-slate-500 dark:text-slate-400",
    code: "font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400",
  };

  if (variant === "code") {
    return (
      <code className={`${styles[variant]} ${className}`} {...props}>
        {children}
      </code>
    );
  }

  return (
    <p className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};
