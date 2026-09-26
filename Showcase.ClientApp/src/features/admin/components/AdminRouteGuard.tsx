import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAuth } from "@shared/context/index.ts";

export interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { currentUser, activePersona, switchPersona } = useAuth();

  const isAdmin =
    activePersona === "admin" ||
    (currentUser?.roles && currentUser.roles.includes("Admin"));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f0eee6] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#faf9f5] border border-[#cccbc8] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d97757]/15 border border-[#d97757]/30 flex items-center justify-center mx-auto text-[#d97757]">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="font-gothic font-extrabold text-2xl uppercase tracking-tight text-[#141413]">
            Admin Privileges Required
          </h2>

          <p className="font-serif text-sm text-[#141413]/70 leading-relaxed">
            This area of the Pority console is reserved for system administrators, curators, and platform moderators.
          </p>

          <div className="pt-3 space-y-2">
            <Button
              type="button"
              variant="clay"
              size="md"
              fullWidth
              onClick={() => switchPersona("admin")}
              className="font-gothic uppercase tracking-wider text-xs justify-center"
            >
              Switch to Admin Persona (Demo)
            </Button>

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
