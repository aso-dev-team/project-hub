"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import { IssueCard } from "@/components/board/issue-card";
import { cn } from "@/lib/utils";
import type { BoardStatus, IssueSummary } from "@/types/api";

interface BoardColumnProps {
  issues: IssueSummary[];
  status: BoardStatus;
}

export function BoardColumn({ issues, status }: BoardColumnProps): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({
    id: status.key,
    data: {
      type: "column",
      statusKey: status.key,
    },
  });

  return (
    <section
      className={cn(
        "flex min-h-[28rem] min-w-80 flex-1 flex-col rounded-2xl border bg-white/85 p-3 shadow-sm backdrop-blur-sm",
        isOver ? "ring-2 ring-primary/40" : "",
      )}
      ref={setNodeRef}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-semibold">{status.name}</p>
          <p className="text-xs text-muted-foreground">{issues.length} issues</p>
        </div>
      </div>
      <SortableContext items={issues.map((issue) => issue.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3">
          {issues.length > 0 ? (
            issues.map((issue) => <IssueCard issue={issue} key={issue.id} />)
          ) : (
            <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Drop issue here
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
