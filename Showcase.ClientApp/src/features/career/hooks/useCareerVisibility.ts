import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import type { CareerVisibilitySettings } from "@shared/types/index.ts";

const defaultCareerVisibility: CareerVisibilitySettings = {
  experience: true,
  academics: true,
  skills: true,
  credentials: true,
  languages: true,
  achievements: true,
};

const sectionLabels: Record<keyof CareerVisibilitySettings, string> = {
  experience: "Experience",
  academics: "Academics",
  skills: "Skills",
  credentials: "Credentials",
  languages: "Languages",
  achievements: "Achievements",
};

export function useCareerVisibility() {
  const queryClient = useQueryClient();

  const {
    data: visibility = defaultCareerVisibility,
    isLoading: loading,
    refetch,
  } = useQuery<CareerVisibilitySettings>({
    queryKey: queryKeys.career.visibility(),
    queryFn: () => apiClient.getCareerVisibility(),
    staleTime: 1000 * 60 * 5,
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      section,
      isVisible,
    }: {
      section: keyof CareerVisibilitySettings;
      isVisible: boolean;
    }) => apiClient.toggleSectionVisibility(section, isVisible),
    onMutate: async ({ section, isVisible }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.career.visibility() });
      const previous = queryClient.getQueryData<CareerVisibilitySettings>(
        queryKeys.career.visibility()
      );

      queryClient.setQueryData<CareerVisibilitySettings>(queryKeys.career.visibility(), {
        ...(previous || defaultCareerVisibility),
        [section]: isVisible,
      });

      return { previous };
    },
    onSuccess: (updatedSettings, { section, isVisible }) => {
      if (updatedSettings) {
        queryClient.setQueryData(queryKeys.career.visibility(), updatedSettings);
      }
      queryClient.invalidateQueries({ queryKey: ["career", "public"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.career.summary() });

      const label = sectionLabels[section] || section;
      toast.success(
        isVisible
          ? `${label} is now visible on your public profile`
          : `${label} is hidden from your public profile`
      );
    },
    onError: (err, { section }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.career.visibility(), context.previous);
      }
      const label = sectionLabels[section] || section;
      toast.error(extractApiErrorMessage(err, `Failed to update visibility for ${label}`));
    },
  });

  const toggleSection = useCallback(
    async (section: keyof CareerVisibilitySettings, isVisible: boolean) => {
      try {
        await toggleMutation.mutateAsync({ section, isVisible });
      } catch {
        // Handled in onError
      }
    },
    [toggleMutation]
  );

  return {
    visibility,
    loading,
    isToggling: toggleMutation.isPending,
    toggleSection,
    reloadVisibility: refetch,
  };
}
