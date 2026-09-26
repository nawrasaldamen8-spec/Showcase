import React, { useState, useEffect } from 'react';
import { Eye, Shield, Sparkles } from 'lucide-react';

export type DemoPersona = 'visitor' | 'creator' | 'admin';

export interface DemoSwitcherProps {
  currentPersona?: DemoPersona;
  onPersonaChange?: (persona: DemoPersona) => void;
  className?: string;
}

const STORAGE_KEY = 'showcase_active_persona';

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  currentPersona: controlledPersona,
  onPersonaChange,
  className = '',
}) => {
  const [internalPersona, setInternalPersona] = useState<DemoPersona>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'visitor' || stored === 'creator' || stored === 'admin') {
        return stored;
      }
    }
    return 'creator';
  });

  const activePersona = controlledPersona ?? internalPersona;

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'visitor' || e.newValue === 'creator' || e.newValue === 'admin')) {
        setInternalPersona(e.newValue);
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<DemoPersona>;
      if (customEvent.detail === 'visitor' || customEvent.detail === 'creator' || customEvent.detail === 'admin') {
        setInternalPersona(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('showcase:persona-change', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('showcase:persona-change', handleCustomChange);
    };
  }, []);

  const handleSelect = (mode: DemoPersona) => {
    if (mode === activePersona) return;

    if (controlledPersona === undefined) {
      setInternalPersona(mode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
        window.dispatchEvent(new CustomEvent('showcase:persona-change', { detail: mode }));
      }
    }

    onPersonaChange?.(mode);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Demo persona switcher"
      className={`inline-flex items-center p-0.5 sm:p-1 bg-[#e8e5dc] rounded-[999px] border border-[#cccbc8] select-none ${className}`.trim()}
    >
      <button
        type="button"
        role="radio"
        aria-checked={activePersona === 'visitor'}
        onClick={() => handleSelect('visitor')}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[999px] font-gothic text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 cursor-pointer ${
          activePersona === 'visitor'
            ? 'bg-[#141413] text-[#faf9f5]'
            : 'text-[#87867f] hover:text-[#141413]'
        }`}
      >
        <Eye className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Visitor</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={activePersona === 'creator'}
        onClick={() => handleSelect('creator')}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[999px] font-gothic text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 cursor-pointer ${
          activePersona === 'creator'
            ? 'bg-[#d97757] text-[#faf9f5]'
            : 'text-[#87867f] hover:text-[#141413]'
        }`}
      >
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Creator</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={activePersona === 'admin'}
        onClick={() => handleSelect('admin')}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[999px] font-gothic text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 cursor-pointer ${
          activePersona === 'admin'
            ? 'bg-[#2e7d32] text-[#faf9f5]'
            : 'text-[#87867f] hover:text-[#141413]'
        }`}
      >
        <Shield className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Admin</span>
      </button>
    </div>
  );
};
