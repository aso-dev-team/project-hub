"use client";

import { LoaderCircle, LogOut, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { IssueBoard } from "@/components/board/issue-board";
import { IssueComposerDialog } from "@/components/board/issue-composer-dialog";
import { ProjectSidebar } from "@/components/board/project-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBoardQuery, useCreateIssueMutation, useMoveIssueMutation } from "@/hooks/use-board";
import { useBoardRealtime } from "@/hooks/use-board-realtime";
import { useSignOutMutation } from "@/hooks/use-auth";
import type { SessionUser } from "@/types/api";

interface BoardPageProps {
  selectedProjectId: string;
  selectedTeamId: string;
  setSelectedProjectId: (projectId: string) => void;
  user: SessionUser;
}

export function BoardPage(props: BoardPageProps): JSX.Element {
  const boardQuery = useBoardQuery(props.selectedTeamId, props.selectedProjectId);
  const createIssueMutation = useCreateIssueMutation(props.selectedProjectId);
  const moveIssueMutation = useMoveIssueMutation(props.selectedProjectId);
  const signOutMutation = useSignOutMutation();
  const [composerOpen, setComposerOpen] = useState(false);

  useBoardRealtime(props.selectedProjectId, Boolean(props.user.id));

  useEffect(() => {
    const handleOpenComposer: EventListener = () => {
      setComposerOpen(true);
    };

    window.addEventListener("issue-composer:open", handleOpenComposer);
    return () => {
      window.removeEventListener("issue-composer:open", handleOpenComposer);
    };
  }, []);


  const activeProjectName = useMemo(() => boardQuery.data?.activeProject.name ?? "Project", [boardQuery.data]);

  if (boardQuery.isLoading && !boardQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!boardQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-xl">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Board の取得に失敗しました。API が起動しているか確認してください。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const board = boardQuery.data;

  return (
    <div className="flex min-h-screen gap-4 p-4 lg:p-6">
      <ProjectSidebar
        activeProjectId={props.selectedProjectId}
        onSelect={props.setSelectedProjectId}
        projects={board.projects}
      />
      <main className="flex min-w-0 flex-1 flex-col gap-4">
        <Card className="border-white/70 bg-white/85 backdrop-blur-sm">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                Next.js + ASP.NET Core + PostgreSQL + Go
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{board.activeProject.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {board.workspaceName} / {board.activeTeam.name} / {board.activeProject.key}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setComposerOpen(true)} variant="outline">
                Quick add issue
              </Button>
              <Button
                onClick={() => {
                  signOutMutation.mutate();
                }}
                variant="ghost"
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        <IssueBoard
          board={board}
          onMove={(payload) => {
            moveIssueMutation.mutate({
              issueId: payload.issueId,
              payload: {
                afterIssueId: payload.afterIssueId,
                beforeIssueId: payload.beforeIssueId,
                statusKey: payload.statusKey,
              },
            });
          }}
        />

        <IssueComposerDialog
          isSubmitting={createIssueMutation.isPending}
          onOpenChange={setComposerOpen}
          onSubmit={(payload) => {
            createIssueMutation.mutate(
              {
                descriptionHtml: payload.descriptionHtml,
                projectId: props.selectedProjectId,
                title: payload.title,
              },
              {
                onSuccess: () => {
                  setComposerOpen(false);
                },
              },
            );
          }}
          open={composerOpen}
          projectName={activeProjectName}
        />
      </main>
    </div>
  );
}
