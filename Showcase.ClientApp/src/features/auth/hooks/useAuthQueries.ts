import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys, tokenStorage } from "@shared/api/index.ts";
import type { CurrentUserResponse, LoginRequest, RegisterRequest } from "@shared/types/index.ts";

export function useCurrentUserQuery(options?: { enabled?: boolean }) {
  return useQuery<CurrentUserResponse | null>({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => apiClient.getCurrentUser(),
    enabled: options?.enabled ?? Boolean(tokenStorage.getToken()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success("Welcome back!");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Login failed. Please check your credentials."));
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Account created successfully! Welcome to Pority!");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Registration failed. Please try again."));
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      tokenStorage.clear();
      queryClient.clear();
      toast.info("You have been logged out.");
    },
    onError: () => {
      tokenStorage.clear();
      queryClient.clear();
    },
  });
}
