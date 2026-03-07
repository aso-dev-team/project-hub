"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";

import { BoardColumn } from "@/components/board/board-column";
import { IssueCard } from "@/components/board/issue-card";
import type { BoardResponse, IssueStatusKey, IssueSummary } from "@/types/api";

interface IssueBoardProps {
  board: BoardResponse;
  onMove: (payload: {
    afterIssueId: string;
    beforeIssueId: string;
    issueId: string;
    statusKey: IssueStatusKey;
  }) => void;
}

function orderIssues(issues: IssueSummary[]): IssueSummary[] {
  return [...issues].sort((left, right) => left.order.localeCompare(right.order));
}

// 並び順の正はサーバー側に寄せ、クライアントは DnD の結果を mutation に変換するだけにしています。
export function IssueBoard({ board, onMove }: IssueBoardProps): JSX.Element {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );
  const [activeIssue, setActiveIssue] = useState<IssueSummary | null>(null);

  const issuesByStatus = useMemo(() => {
    return board.statuses.reduce<Record<string, IssueSummary[]>>((result, status) => {
      result[status.key] = orderIssues(board.issues.filter((issue) => issue.statusKey === status.key));
      return result;
    }, {});
  }, [board.issues, board.statuses]);

  const handleDragStart = (event: DragStartEvent): void => {
    const activeData = event.active.data.current;
    if (activeData && activeData.type === "issue") {
      setActiveIssue(activeData.issue as IssueSummary);
    }
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveIssue(null);

    if (!event.over) {
      return;
    }

    const activeData = event.active.data.current;
    const overData = event.over.data.current;

    if (!activeData || activeData.type !== "issue" || !overData) {
      return;
    }

    const issue = activeData.issue as IssueSummary;
    const destinationStatus = overData.type === "column" ? (overData.statusKey as IssueStatusKey) : ((overData.issue as IssueSummary).statusKey as IssueStatusKey);

    const destinationIssues = orderIssues(
      board.issues.filter((candidate) => candidate.statusKey === destinationStatus && candidate.id !== issue.id),
    );

    if (overData.type === "issue") {
      const overIssue = overData.issue as IssueSummary;
      const beforeIssueId = overIssue.id;
      const beforeIndex = destinationIssues.findIndex((candidate) => candidate.id === beforeIssueId);
      const afterIssueId = beforeIndex > 0 ? destinationIssues[beforeIndex - 1].id : "";

      onMove({
        issueId: issue.id,
        statusKey: destinationStatus,
        beforeIssueId,
        afterIssueId,
      });
      return;
    }

    const lastIssue = destinationIssues.at(-1);

    onMove({
      issueId: issue.id,
      statusKey: destinationStatus,
      beforeIssueId: "",
      afterIssueId: lastIssue?.id ?? "",
    });
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
      <div className="flex min-w-max gap-4 overflow-x-auto pb-4">
        {board.statuses.map((status) => (
          <BoardColumn issues={issuesByStatus[status.key]} key={status.key} status={status} />
        ))}
      </div>
      <DragOverlay>{activeIssue ? <IssueCard issue={activeIssue} /> : null}</DragOverlay>
    </DndContext>
  );
}
