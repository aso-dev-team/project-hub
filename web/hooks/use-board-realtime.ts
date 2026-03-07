"use client";

import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { boardQueryKey } from "@/hooks/use-board";
import type { BoardChangedMessage } from "@/types/api";

const signalrHubUrl = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ?? "http://localhost:5050/hubs/board";

// SignalR はまず invalidate ベースで扱い、差分適用は後から追加しやすい構成にしています。
export function useBoardRealtime(projectId: string, enabled: boolean): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(signalrHubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("BoardChanged", (message: BoardChangedMessage) => {
      if (message.projectId === projectId) {
        void queryClient.invalidateQueries({
          queryKey: boardQueryKey(projectId),
        });
      }
    });

    void connection
      .start()
      .then(() => connection.invoke("JoinProject", projectId))
      .catch(() => {
        // 接続失敗時は Query のポーリング相当にフォールバックする前提です。
      });

    return () => {
      void connection.stop();
    };
  }, [enabled, projectId, queryClient]);
}
