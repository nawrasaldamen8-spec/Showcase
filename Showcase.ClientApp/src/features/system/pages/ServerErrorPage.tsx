import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";

export const ServerErrorPage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f0eee6] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-[#d97757] selection:text-[#faf9f5]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#faf9f5] border border-[#cccbc8] flex items-center justify-center mx-auto text-[#d97757] shadow-none">
          <ServerCrash className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e5dc] border border-[#cccbc8] font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-[#87867f]">
            <span>Status Code 500</span>
          </div>

          <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#141413]">
            Studio Service Interruption
          </h1>

          <p className="font-serif text-sm text-[#141413]/70 max-w-sm mx-auto leading-relaxed">
            The studio backend is currently undergoing maintenance or experiencing an unexpected exception. Your portfolio data remains secure.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button
            type="button"
            variant="clay"
            size="md"
            onClick={handleReload}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto font-gothic uppercase tracking-wider text-xs justify-center"
          >
            Retry Connection
          </Button>

          <Link to="/" className="w-full sm:w-auto text-decoration-none">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full sm:w-auto font-gothic uppercase tracking-wider text-xs justify-center"
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
