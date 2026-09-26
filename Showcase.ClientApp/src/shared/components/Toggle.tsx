import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  id,
  className = "",
}) => {
  const switchId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const isSm = size === "sm";
  const trackWidth = isSm ? "w-9 h-5" : "w-11 h-6";
  const knobSize = isSm ? "w-3.5 h-3.5" : "w-4 h-4";
  const translateDistance = isSm ? "translate-x-4" : "translate-x-5";

  return (
    <div className={`inline-flex items-center gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex items-center shrink-0 ${trackWidth} rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] focus-visible:ring-offset-2 border border-[#cccbc8]/60 ${
          checked ? "bg-[#141413] border-[#141413]" : "bg-[#dedcd5]"
        }`}
      >
        <span className="sr-only">{typeof label === "string" ? label : "Toggle"}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block ${knobSize} rounded-full bg-[#faf9f5] transform transition duration-200 ease-in-out ml-0.5 ${
            checked ? translateDistance : "translate-x-0"
          }`}
        />
      </button>

      {(label || description) && (
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`select-none ${disabled ? "" : "cursor-pointer"}`}
        >
          {label && (
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] block">
              {label}
            </span>
          )}
          {description && (
            <span className="font-serif text-[13px] text-[#141413]/65 block mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
