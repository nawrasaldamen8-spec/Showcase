import { Sparkles } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { StatusRequestPage } from "../components/StatusRequestPage.tsx";

export const FeaturedRequestPage: React.FC = () => {
  return (
    <StatusRequestPage
      title="Featured Suggestions Request"
      subtitle="Apply to have your profile and architectural projects featured in creator suggestions and discovery recommendations."
      badge="Discovery & Promotion"
      statusField="featuredStatus"
      approvedStatusValue="featured"
      submitFn={(message) => apiClient.submitFeaturedRequest({ message, notes: message })}
      successMessage="Featured suggestions request submitted successfully."
      approvedTitle="Profile Actively Featured"
      approvedDescription="Your profile and portfolio are featured in creator discovery recommendations and suggestions across Pority."
      approvedFooter="No further action required. Your showcase is in active rotation."
      approvedRenderIcon={() => (
        <div className="w-9 h-9 rounded-full bg-[#2e7d32]/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#2e7d32]" />
        </div>
      )}
      pendingTitle="Featured Request Pending"
      pendingDescription="Your request has been received and is currently under review by our curation team."
      formLabel="Why should your work be featured?"
      formPlaceholder="Tell us about your recent notable projects, key architectural contributions, or why you would like to be featured in discovery recommendations..."
      formHelperText="Be clear and concise. Our curatorial committee reviews submissions regularly."
      buttonLabel="Submit Featured Request"
    />
  );
};
