import { UserCheck } from "lucide-react";
import React from "react";
import { Button } from "../forms/Button.tsx";

export interface VisitorGuardProps {
  eyebrow?: string;
  title?: string;
  description: string;
  onSwitchPersona: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  secondaryAction?: React.ReactNode;
}

export const VisitorGuard: React.FC<VisitorGuardProps> = ({
  eyebrow = "Studio Access \u2022 Authentication Notice",
  title = "Creator Mode Required",
  description,
  onSwitchPersona,
  icon: Icon = UserCheck,
  secondaryAction,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-flex items-center justify-center p-4 rounded-full bg-ivory-light border border-stone text-cloud-dark mb-6">
        <Icon className="h-10 w-10 stroke-[1.5]" />
      </div>
      <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-cloud-dark block mb-2">
        {eyebrow}
      </span>
      <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-dark">
        {title}
      </h1>
      <p className="font-serif text-[18px] text-slate-dark/80 mt-4 leading-relaxed max-w-lg mx-auto">
        {description}
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button variant="clay" size="md" onClick={onSwitchPersona}>
          Switch to Creator Persona
        </Button>
        {secondaryAction}
      </div>
    </div>
  );
};
