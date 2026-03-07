"use client";

import { useState } from "react";

import { BoardPage } from "@/components/board/board-page";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useCurrentUserQuery } from "@/hooks/use-auth";
import { useAppHotkeys } from "@/hooks/use-app-hotkeys";

const defaultTeamId = process.env.NEXT_PUBLIC_DEFAULT_TEAM_ID ?? "team-product";
const defaultProjectId = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID ?? "project-roadmap";

export function AppShell(): JSX.Element {
  const currentUserQuery = useCurrentUserQuery();
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId);

  useAppHotkeys({
    enabled: Boolean(currentUserQuery.data),
    onCreateIssue: () => {
      const event = new CustomEvent("issue-composer:open");
      window.dispatchEvent(event);
    },
  });

  if (currentUserQuery.isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!currentUserQuery.data) {
    return <SignInForm />;
  }

  return (
    <BoardPage
      selectedProjectId={selectedProjectId}
      selectedTeamId={defaultTeamId}
      setSelectedProjectId={setSelectedProjectId}
      user={currentUserQuery.data}
    />
  );
}
