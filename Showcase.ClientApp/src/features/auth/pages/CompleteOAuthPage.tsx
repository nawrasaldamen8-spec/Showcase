import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, Sparkles } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import { AuthCardLayout } from "../components/AuthCardLayout.tsx";

export const CompleteOAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchPersona, register } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = username.trim();
    if (!handle) {
      showToast("error", "Please choose a valid username handle.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: handle,
        email: `${handle}@google.user`,
        password: "OAuthUser123!",
        firstName: handle,
        lastName: "",
      });
      switchPersona("creator");
      showToast("success", "Google account connected successfully.");
      navigate("/studio");
    } catch {
      showToast("error", "Unable to complete Google onboarding.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCardLayout
      title="Choose Your Handle"
      subtitle="Complete your Pority setup by choosing your unique username handle."
      badge="OAuth Completion"
    >
      <form onSubmit={handleComplete} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="oauth-username"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
          >
            <AtSign className="w-3.5 h-3.5 text-[#87867f]" />
            <span>Username Handle <span className="text-[#d97757]">*</span></span>
          </label>
          <Input
            id="oauth-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="e.g. username"
            required
            autoFocus
          />
          <p className="font-serif text-[11px] text-[#87867f]">
            Your permanent portfolio URL will be: pority.design/u/{username || "handle"}
          </p>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs justify-center"
          >
            Complete Registration
          </Button>
        </div>
      </form>
    </AuthCardLayout>
  );
};
