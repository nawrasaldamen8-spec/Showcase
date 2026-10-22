import React from "react";

export interface AuthCardLayoutProps {
  title: string;
  currentStep?: number;
  totalSteps?: number;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  title,
  currentStep,
  totalSteps,
  children,
  footerContent,
}) => {
  return (
    <div
      style={{ viewTransitionName: "auth-card" }}
      className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-7 space-y-4 shadow-none overflow-hidden"
    >
      <header className="border-b border-stone/50 pb-3 flex items-center justify-between gap-3">
        <h2 className="font-gothic font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-slate-dark truncate">
          {title}
        </h2>
        {currentStep && totalSteps && (
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark shrink-0">
            Step {currentStep} of {totalSteps}
          </span>
        )}
      </header>

      {children}

      {footerContent && (
        <div className="-mx-5 sm:-mx-7 -mb-5 sm:-mb-7 px-5 sm:px-7 py-3.5 border-t border-stone/50 text-center font-serif text-xs text-cloud-dark">
          {footerContent}
        </div>
      )}
    </div>
  );
};
