import { Phone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  apiClient,
  extractApiErrorMessage,
  extractApiFieldErrors,
  extractApiProblemDetails,
} from "@shared/api/index.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const ManagePhonePage: React.FC = () => {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    setFieldErrors({});

    const trimmedPhone = phoneNumber.trim();

    // Basic phone validation if provided
    if (trimmedPhone && !/^[+0-9\s\-()]{6,20}$/.test(trimmedPhone)) {
      setFieldErrors({
        phoneNumber: "Please enter a valid international phone number format.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.updatePhone({
        phoneNumber: trimmedPhone,
      });

      toast.success("Phone number updated successfully.");
      navigate("/settings/security");
    } catch (err: unknown) {
      const extractedFields = extractApiFieldErrors(err);
      const problemDetails = extractApiProblemDetails(err);
      setFieldErrors(extractedFields);
      setProblem(problemDetails);
      const errorMsg = extractApiErrorMessage(err, "An error occurred while saving your phone number.");
      toast.error(errorMsg);
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
        {problem && !Object.keys(fieldErrors).length && <ProblemAlert problem={problem} />}

        <div className="space-y-4">
          <Input
            id="phone-number"
            label="Phone Number"
            type="tel"
            placeholder="+962 7 9000 0000"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (fieldErrors.phoneNumber || fieldErrors.PhoneNumber) {
                setFieldErrors((prev) => ({ ...prev, phoneNumber: "", PhoneNumber: "" }));
              }
            }}
            disabled={isFetching || isLoading}
            errorMessage={fieldErrors.phoneNumber || fieldErrors.PhoneNumber}
            leftIcon={<Phone className="h-4 w-4 text-cloud-dark" />}
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
