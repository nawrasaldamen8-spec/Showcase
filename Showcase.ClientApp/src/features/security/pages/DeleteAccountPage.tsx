import { AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  extractApiErrorMessage,
  extractApiFieldErrors,
  extractApiProblemDetails,
} from "@shared/api/index.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth } from "@shared/context/useAuth.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);
    setFieldErrors({});

    const clientErrors: Record<string, string> = {};
    if (!password) {
      clientErrors.password = "Please enter your password.";
    }

    if (confirmText.trim().toUpperCase() !== "DELETE") {
      clientErrors.confirmText = 'Please type "DELETE" to confirm.';
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsDeleting(true);

    try {
      await logout();
      toast.info("Your account and data have been permanently deleted.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const extractedFields = extractApiFieldErrors(err);
      const problemDetails = extractApiProblemDetails(err);
      setFieldErrors(extractedFields);
      setProblem(problemDetails);
      const errorMsg = extractApiErrorMessage(err, "Failed to delete account.");
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Delete Account"
      subtitle="Permanently delete your account and all associated data."
      badge="Danger Zone"
    >
      <form onSubmit={handleDelete} className="space-y-6" noValidate>
        {/* Warning Callout Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-clay/10 border border-clay/30 space-y-2.5 text-slate-dark">
          <div className="flex items-center gap-2 text-clay">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="font-gothic text-xs font-bold uppercase tracking-wider">
              Warning: Irreversible Action
            </span>
          </div>

          <p className="font-serif text-xs sm:text-sm leading-relaxed text-slate-dark/85">
            Deleting your account will permanently remove your profile, published works, career
            records, and account data. This action cannot be undone.
          </p>
        </div>

        {problem && !Object.keys(fieldErrors).length && <ProblemAlert problem={problem} />}

        {/* Password Authorization */}
        <Input
          label="Confirm Your Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password || fieldErrors.Password) {
              setFieldErrors((prev) => ({ ...prev, password: "", Password: "" }));
            }
          }}
          placeholder="Enter current password"
          required
          disabled={isDeleting}
          errorMessage={fieldErrors.password || fieldErrors.Password}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="hover:text-slate-dark transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {/* Typed Confirmation Safeguard */}
        <Input
          label='Type "DELETE" To Confirm'
          value={confirmText}
          onChange={(e) => {
            setConfirmText(e.target.value);
            if (fieldErrors.confirmText) {
              setFieldErrors((prev) => ({ ...prev, confirmText: "" }));
            }
          }}
          placeholder="DELETE"
          required
          disabled={isDeleting}
          errorMessage={fieldErrors.confirmText}
          helperText="Type the word in uppercase to prevent accidental deletion."
          className="font-mono uppercase tracking-widest"
        />

        {/* Destructive Full-Width Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isDeleting}
            disabled={!password || confirmText.trim().toUpperCase() !== "DELETE"}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="justify-center font-gothic uppercase tracking-wider text-xs bg-clay hover:bg-[#c46142] text-ivory-light border-transparent shadow-none"
          >
            Permanently Delete Account
          </Button>
        </div>
      </form>
    </SecurityActionLayout>
  );
};
