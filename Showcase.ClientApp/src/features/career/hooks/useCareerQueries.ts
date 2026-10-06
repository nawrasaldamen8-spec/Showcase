import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import type {
  CareerAcademic,
  CareerAchievement,
  CareerCredential,
  CareerExperience,
  CareerLanguage,
  CareerSkill,
  CareerVisibilitySettings,
  PublicCareerData,
} from "@shared/types/index.ts";

export function usePublicCareerQuery(username?: string) {
  return useQuery<PublicCareerData>({
    queryKey: queryKeys.career.public(username),
    queryFn: () => apiClient.getPublicCareer(username),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useCareerVisibilityQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerVisibilitySettings>({
    queryKey: queryKeys.career.visibility(),
    queryFn: () => apiClient.getCareerVisibility(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateCareerVisibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<CareerVisibilitySettings>) => apiClient.updateCareerVisibility(settings),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.career.visibility(), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.career.all });
      toast.success("Career privacy settings updated.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update career privacy."));
    },
  });
}

// Experiences
export function useCareerExperiencesQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerExperience[]>({
    queryKey: queryKeys.career.experiences(),
    queryFn: () => apiClient.getExperiences(),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateExperienceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CareerExperience>) => apiClient.createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.experiences() });
      toast.success("Experience added successfully!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to add experience.")),
  });
}

export function useUpdateExperienceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CareerExperience> }) => apiClient.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.experiences() });
      toast.success("Experience updated!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to update experience.")),
  });
}

export function useDeleteExperienceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.experiences() });
      toast.success("Experience removed.");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to delete experience.")),
  });
}

// Academics
export function useCareerAcademicsQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerAcademic[]>({
    queryKey: queryKeys.career.academics(),
    queryFn: () => apiClient.getAcademics(),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAcademicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CareerAcademic>) => apiClient.createAcademic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.academics() });
      toast.success("Academic qualification added!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to add academic entry.")),
  });
}

export function useUpdateAcademicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CareerAcademic> }) => apiClient.updateAcademic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.academics() });
      toast.success("Academic entry updated!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to update academic entry.")),
  });
}

export function useDeleteAcademicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAcademic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.academics() });
      toast.success("Academic entry removed.");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to delete academic entry.")),
  });
}

// Skills
export function useCareerSkillsQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerSkill[]>({
    queryKey: queryKeys.career.skills(),
    queryFn: () => apiClient.getSkills(),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CareerSkill>) => apiClient.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.skills() });
      toast.success("Skill added!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to add skill.")),
  });
}

export function useUpdateSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CareerSkill> }) => apiClient.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.skills() });
      toast.success("Skill updated!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to update skill.")),
  });
}

export function useDeleteSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.skills() });
      toast.success("Skill removed.");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to delete skill.")),
  });
}

// Languages
export function useCareerLanguagesQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerLanguage[]>({
    queryKey: queryKeys.career.languages(),
    queryFn: () => apiClient.getLanguages(),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateLanguageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CareerLanguage>) => apiClient.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.languages() });
      toast.success("Language added!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to add language.")),
  });
}

export function useUpdateLanguageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CareerLanguage> }) => apiClient.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.languages() });
      toast.success("Language updated!");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to update language.")),
  });
}

export function useDeleteLanguageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.career.languages() });
      toast.success("Language removed.");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to delete language.")),
  });
}

// Achievements
export function useCareerAchievementsQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerAchievement[]>({
    queryKey: queryKeys.career.achievements(),
    queryFn: () => apiClient.getAchievements(),
    enabled: options?.enabled ?? true,
  });
}

// Credentials
export function useCareerCredentialsQuery(options?: { enabled?: boolean }) {
  return useQuery<CareerCredential[]>({
    queryKey: queryKeys.career.credentials(),
    queryFn: () => apiClient.getCredentials(),
    enabled: options?.enabled ?? true,
  });
}
