import { AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button.tsx";
import { Input } from "../../../shared/components/Input.tsx";
import { useToast } from "../../../shared/context/index.ts";
import { useAuth } from "../../../shared/context/useAuth.ts";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please provide your current password to authorize account deletion.");
      return;
    }

    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError("Please type DELETE in capital letters to confirm this irreversible action.");
      return;
    }

    setIsDeleting(true);

    setTimeout(() => {
      setIsDeleting(false);
      logout();
      showToast("info", "Your account and all associated exhibition records have been permanently removed.");
      navigate("/studio");
    }, 800);
  };

  return (
    <SecurityActionLayout
      title="Delete Account"
      subtitle="Permanently withdraw your creator membership and destroy all associated records."
      badge="Danger Zone"
    >
      <form onSubmit={handleDelete} className="space-y-6">
        {/* Warning Callout Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#d97757]/10 border border-[#d97757]/30 space-y-2.5 text-[#141413]">
          <div className="flex items-center gap-2 text-[#d97757]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="font-gothic text-xs font-bold uppercase tracking-wider">Irreversible Action Warning</span>
          </div>

          <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#141413]/85">
            Deleting your account will permanently purge your portfolio plates, biographical statement, social archives,
            and public profile slug. This data cannot be recovered.
          </p>
        </div>

        {/* Password Authorization */}
        <Input
          label="Confirm Your Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter current password"
          required
          disabled={isDeleting}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="hover:text-[#141413] transition-colors p-1"
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
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          required
          disabled={isDeleting}
          helperText="Type the word in uppercase to prevent accidental deletion."
          className="font-mono uppercase tracking-widest"
        />

        {error && (
          <div className="p-3 rounded-lg bg-[#d97757]/10 border border-[#d97757]/30 text-xs font-serif text-[#d97757]">
            {error}
          </div>
        )}

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
            className="justify-center font-gothic uppercase tracking-wider text-xs bg-[#d97757] hover:bg-[#c46142] text-[#faf9f5] border-transparent shadow-none"
          >
            Permanently Delete My Account
          </Button>
        </div>
      </form>
    </SecurityActionLayout>
  );
};
