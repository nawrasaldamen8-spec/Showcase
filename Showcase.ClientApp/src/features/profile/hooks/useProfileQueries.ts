import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys, tokenStorage } from "@shared/api/index.ts";
import type {
  AddSocialLinkRequest,
  FeaturedRequestDto,
  PaginatedList,
  ProfileDetailsResponse,
  PublicProfileResponse,
  ReorderSocialLinksRequest,
  UpdatePhoneRequest,
  UpdateProfileRequest,
  UpdateSocialLinkRequest,
  VerificationRequestDto,
} from "@shared/types/index.ts";

export function useMyProfileQuery(options?: { enabled?: boolean }) {
  return useQuery<ProfileDetailsResponse>({
    queryKey: queryKeys.profiles.me(),
    queryFn: () => apiClient.getMyProfile(),
    enabled: options?.enabled ?? Boolean(tokenStorage.getToken()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePublicProfileQuery(username: string, options?: { enabled?: boolean }) {
  return useQuery<PublicProfileResponse>({
    queryKey: queryKeys.profiles.public(username),
    queryFn: () => apiClient.getPublicProfile(username),
    enabled: options?.enabled ?? Boolean(username),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useInfiniteProfilesQuery(
  params?: { search?: string; featuredOnly?: boolean; pageSize?: number }
) {
  const pageSize = params?.pageSize ?? 24;
  return useInfiniteQuery<PaginatedList<PublicProfileResponse>, Error>({
    queryKey: queryKeys.profiles.infiniteDirectory(params),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getProfiles({
        ...params,
        pageNumber: pageParam as number,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => apiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update profile."));
    },
  });
}

export function useUpdatePhoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePhoneRequest) => apiClient.updatePhone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      toast.success("Phone number updated successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update phone number."));
    },
  });
}

export function useAvatarUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { uploadUrl, storageKey } = await apiClient.getAvatarUploadUrl({
        contentType: file.type || "image/jpeg",
        fileSizeBytes: file.size,
      });

      const publicUrl = await apiClient.uploadImageFile(uploadUrl, file);
      await apiClient.updateAvatar(storageKey, publicUrl);
      return { storageKey, publicUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success("Profile photo updated!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to upload profile photo."));
    },
  });
}

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.removeAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success("Profile photo removed.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to remove photo."));
    },
  });
}

export function useAddSocialLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddSocialLinkRequest) => apiClient.addSocialLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      toast.success("Social link added!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to add social link."));
    },
  });
}

export function useUpdateSocialLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSocialLinkRequest }) =>
      apiClient.updateSocialLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      toast.success("Social link updated!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update social link."));
    },
  });
}

export function useDeleteSocialLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSocialLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      toast.success("Social link deleted.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to delete social link."));
    },
  });
}

export function useReorderSocialLinksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderSocialLinksRequest) => apiClient.reorderSocialLinks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to reorder social links."));
    },
  });
}

export function useSubmitVerificationRequestMutation() {
  return useMutation({
    mutationFn: (data: VerificationRequestDto) => apiClient.submitVerificationRequest(data),
    onSuccess: () => {
      toast.success("Verification request submitted successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to submit verification request."));
    },
  });
}

export function useSubmitFeaturedRequestMutation() {
  return useMutation({
    mutationFn: (data: FeaturedRequestDto) => apiClient.submitFeaturedRequest(data),
    onSuccess: () => {
      toast.success("Featured creator request submitted successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to submit featured request."));
    },
  });
}
