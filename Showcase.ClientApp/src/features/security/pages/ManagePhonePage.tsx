import { Phone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useToast } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const ManagePhonePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  useEffect(() => {
    let isMounted = true;
    void apiClient
      .getMyProfile()
      .then((profile) => {
        if (isMounted) {
          setPhoneNumber(profile.phoneNumber || "");
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load profile details", err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsFetching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);

    const trimmedPhone = phoneNumber.trim();

    // Basic phone validation if provided
    if (trimmedPhone && !/^[+0-9\s\-()]{6,20}$/.test(trimmedPhone)) {
      setProblem({
        title: "Validation Error",
        detail: "Please enter a valid international phone number format.",
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.updatePhone({
        phoneNumber: trimmedPhone,
      });

      showToast("success", "Phone number updated successfully.");
      navigate("/settings/security");
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Update Failed",
        detail: p?.detail || "An error occurred while saving your phone number.",
        status: p?.status || 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Phone Number"
      subtitle="Attach your phone number for account recovery and official communications."
      badge="Account Information"
      backTo="/settings/security"
      backLabel="Back to Account Security"
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <ProblemAlert problem={problem} />

        <div className="space-y-4">
          <Input
            id="phone-number"
            label="Phone Number"
            type="tel"
            placeholder="+962 7 9000 0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isFetching}
            leftIcon={<Phone className="h-4 w-4 text-[#87867f]" />}
            helperText="Used for account recovery and security alerts"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || isFetching}
            className="w-full sm:w-auto"
          >
            Save Phone Number
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/settings/security")}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </SecurityActionLayout>
  );
};
