"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { appApiRequest } from "@/lib/api-client";
import type {
  BoardResponse,
  CreateIssueRequest,
  IssueStatusKey,
  IssueSummary,
  MoveIssueRequest,
} from "@/types/api";

export const boardQueryKey = (projectId: string) => ["board", projectId] as const;

export function useBoardQuery(teamId: string, projectId: string) {
  return useQuery<BoardResponse>({
    queryKey: boardQueryKey(projectId),
    queryFn: () =>
      appApiRequest<BoardResponse>(
        `/api/app/board?teamId=${encodeURIComponent(teamId)}&projectId=${encodeURIComponent(projectId)}`,
        {
          method: "GET",
        },
      ),
  });
}

function normalizeIssueOrder(issues: IssueSummary[]): IssueSummary[] {
  return [...issues].sort((left, right) => {
    if (left.statusKey !== right.statusKey) {
      return left.statusKey.localeCompare(right.statusKey);
    }

    return left.order.localeCompare(right.order);
  });
}

function applyMove(
  board: BoardResponse,
  issueId: string,
  statusKey: IssueStatusKey,
  beforeIssueId: string,
  afterIssueId: string,
): BoardResponse {
  const issuesWithoutActive = board.issues.filter((issue) => issue.id !== issueId);
  const movedIssue = board.issues.find((issue) => issue.id === issueId);

  if (!movedIssue) {
    return board;
  }

  const nextIssue: IssueSummary = {
    ...movedIssue,
    statusKey,
  };

  const sameColumnIssues = issuesWithoutActive.filter((issue) => issue.statusKey === statusKey);
  const otherIssues = issuesWithoutActive.filter((issue) => issue.statusKey !== statusKey);

  const beforeIndex = beforeIssueId.length > 0 ? sameColumnIssues.findIndex((issue) => issue.id === beforeIssueId) : -1;
  const afterIndex = afterIssueId.length > 0 ? sameColumnIssues.findIndex((issue) => issue.id === afterIssueId) : -1;

  const insertionIndex = beforeIndex >= 0 ? beforeIndex : afterIndex >= 0 ? afterIndex + 1 : sameColumnIssues.length;

  sameColumnIssues.splice(insertionIndex, 0, nextIssue);

  const resequencedColumn = sameColumnIssues.map((issue, index) => ({
    ...issue,
    order: `${(index + 1) * 1000}`.padStart(6, "0"),
  }));

  return {
    ...board,
    issues: normalizeIssueOrder([...otherIssues, ...resequencedColumn]),
  };
}

export function useCreateIssueMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateIssueRequest) =>
      appApiRequest<IssueSummary>("/api/app/issues", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardQueryKey(projectId),
      });
    },
  });
}

interface MoveIssueVariables {
  issueId: string;
  payload: MoveIssueRequest;
}

export function useMoveIssueMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, payload }: MoveIssueVariables) =>
      appApiRequest<IssueSummary>(`/api/app/issues/${encodeURIComponent(issueId)}/move`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: boardQueryKey(projectId),
      });

      const previousBoard = queryClient.getQueryData<BoardResponse>(boardQueryKey(projectId));

      if (previousBoard) {
        queryClient.setQueryData<BoardResponse>(
          boardQueryKey(projectId),
          applyMove(
            previousBoard,
            variables.issueId,
            variables.payload.statusKey,
            variables.payload.beforeIssueId,
            variables.payload.afterIssueId,
          ),
        );
      }

      return { previousBoard };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(boardQueryKey(projectId), context.previousBoard);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardQueryKey(projectId),
      });
    },
  });
}
