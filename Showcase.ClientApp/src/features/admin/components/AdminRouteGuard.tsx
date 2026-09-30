import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAuth } from "@shared/context/index.ts";

export interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-dark/20 border-t-slate-dark animate-spin" />
          <span className="font-gothic text-xs uppercase tracking-widest text-cloud-dark">
            Verifying Privileges...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory-medium flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-ivory-light border border-stone space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-clay/15 border border-clay/30 flex items-center justify-center mx-auto text-clay">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="font-gothic font-extrabold text-2xl uppercase tracking-tight text-slate-dark">
            Admin Privileges Required
          </h2>

          <p className="font-serif text-sm text-slate-dark/70 leading-relaxed">
            This area of the Pority console is reserved strictly for system administrators, curators, and platform moderators.
          </p>

          <div className="pt-3">
            <Link to="/studio" className="block text-decoration-none">
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="font-gothic uppercase tracking-wider text-xs justify-center"
              >
                Return to Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

