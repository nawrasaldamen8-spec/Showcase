import { AlertCircle } from "lucide-react";
import React from "react";
import type { ProblemDetails } from "@shared/types/index.ts";

export interface ProblemAlertProps {
  problem: ProblemDetails | null;
  className?: string;
}

export const ProblemAlert: React.FC<ProblemAlertProps> = ({ problem, className = "" }) => {
  if (!problem) return null;

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl bg-clay/10 border border-clay/40 text-slate-dark animate-in fade-in shadow-none ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-clay shrink-0 mt-0.5" />
        <div className="flex-1 text-sm font-serif">
          <p className="font-gothic font-bold uppercase tracking-wider text-xs text-clay">
            {problem.title || "Security Action Error"}
            {problem.status ? ` (HTTP ${problem.status})` : ""}
          </p>
          {problem.detail && <p className="mt-1 text-slate-dark/90">{problem.detail}</p>}

          {/* Validation errors dictionary */}
          {problem.errors && Object.keys(problem.errors).length > 0 && (
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-slate-dark/85 font-mono">
              {Object.entries(problem.errors).flatMap(([field, msgs]) =>
                msgs.map((msg, i) => (
                  <li key={`${field}-${i}`}>
                    <strong className="font-gothic uppercase tracking-wide">{field}:</strong> {msg}
                  </li>
                )),
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
