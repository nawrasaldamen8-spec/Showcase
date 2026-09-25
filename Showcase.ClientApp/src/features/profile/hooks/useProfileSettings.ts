import { useCallback, useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { useAuth, useToast } from "@shared/context/index.ts";
import { useAsyncData } from "@shared/hooks/index.ts";

export type SettingsTab = "details" | "links" | "security";

export function useProfileSettings() {
  const { activePersona, switchPersona } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("details");

  const triggerToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      showToast(type, message);
    },
    [showToast]
  );

  const {
    data: profile,
    isLoading,
    error,
    reload: loadProfile,
    setData: setProfile,
  } = useAsyncData(async () => {
    if (activePersona === "visitor") return null;
    return await apiClient.getMyProfile();
  });

  return {
    activePersona,
    switchPersona,
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    isLoading: activePersona === "visitor" ? false : isLoading,
    error,
    loadProfile,
    triggerToast,
  };
}
