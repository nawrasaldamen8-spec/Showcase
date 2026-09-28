import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { StatusRequestPage } from "../components/StatusRequestPage.tsx";

export const VerificationRequestPage: React.FC = () => {
  return (
    <StatusRequestPage
      title="Account Verification"
      subtitle="Obtain an official verified checkmark badge next to your name to establish trust and professional authenticity."
      badge="Authenticity & Trust"
      statusField="verificationStatus"
      approvedStatusValue="verified"
      submitFn={(message) => apiClient.submitVerificationRequest({ message, notes: message })}
      successMessage="Verification request submitted successfully."
      approvedTitle="Account Officially Verified"
      approvedDescription="Your account is verified with the authentic checkmark badge across all posts, profiles, and directories."
      approvedFooter="No further action required. Your verified badge is actively displayed."
      approvedRenderIcon={() => <VerifiedBadge size="lg" />}
      pendingTitle="Verification Request Pending"
      pendingDescription="Your request has been received and is currently under review."
      formLabel="Verification Details & Professional Proof"
      formPlaceholder="Provide links to your official architectural registration, portfolio references, or relevant professional credentials to assist in verifying your identity..."
      formHelperText="Verified accounts represent authentic architects, designers, and studios."
      buttonLabel="Submit Verification Request"
    />
  );
};
