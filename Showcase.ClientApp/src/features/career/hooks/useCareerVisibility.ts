import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { initialCareerVisibility } from "@shared/api/careerMockData.ts";
import { useToast } from "@shared/context/index.ts";
import type { CareerVisibilitySettings } from "@shared/types/index.ts";

export function useCareerVisibility() {
  const [visibility, setVisibility] = useState<CareerVisibilitySettings>(initialCareerVisibility);
  const [loading, setLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const { showToast } = useToast();

  const loadVisibility = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCareerVisibility();
      setVisibility(data);
    } catch (err) {
      console.error("Failed to load career visibility settings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const data = await apiClient.getCareerVisibility();
        if (mounted) {
          setVisibility(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load career visibility settings", err);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSection = useCallback(
    async (section: keyof CareerVisibilitySettings, isVisible: boolean) => {
      // Optimistic update
      setVisibility((prev) => ({ ...prev, [section]: isVisible }));
      setIsToggling(true);

      const sectionLabels: Record<keyof CareerVisibilitySettings, string> = {
        experience: "Experience",
        academics: "Academics",
        skills: "Skills",
        credentials: "Credentials",
        languages: "Languages",
        achievements: "Achievements",
      };

      const label = sectionLabels[section] || section;

      try {
        await apiClient.toggleSectionVisibility(section, isVisible);
        showToast(
          "success",
          isVisible
            ? `${label} is now visible on your public profile`
            : `${label} is hidden from your public profile`
        );
      } catch (err) {
        console.error(`Failed to update visibility for ${section}`, err);
        showToast("error", `Failed to update visibility for ${label}`);
        // Revert on error
        setVisibility((prev) => ({ ...prev, [section]: !isVisible }));
      } finally {
        setIsToggling(false);
      }
    },
    [showToast]
  );

  return {
    visibility,
    loading,
    isToggling,
    toggleSection,
    reloadVisibility: loadVisibility,
  };
}
