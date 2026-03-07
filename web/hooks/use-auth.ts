"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, appApiRequest } from "@/lib/api-client";
import type { SessionUser, SignInRequest } from "@/types/api";

const currentUserQueryKey = ["auth", "me"] as const;

export function useCurrentUserQuery() {
  return useQuery<SessionUser | null>({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      try {
        return await appApiRequest<SessionUser>("/api/app/auth/me", {
          method: "GET",
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SignInRequest) =>
      appApiRequest<SessionUser>("/api/app/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async (user) => {
      queryClient.setQueryData(currentUserQueryKey, user);
      await queryClient.invalidateQueries({
        queryKey: ["board"],
      });
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      appApiRequest<void>("/api/app/auth/sign-out", {
        method: "POST",
      }),
    onSuccess: async () => {
      queryClient.setQueryData(currentUserQueryKey, null);
      await queryClient.invalidateQueries({
        queryKey: ["board"],
      });
    },
  });
}
