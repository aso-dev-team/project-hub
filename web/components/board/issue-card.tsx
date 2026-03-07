"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock3, GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IssueSummary } from "@/types/api";

interface IssueCardProps {
  issue: IssueSummary;
}

export function IssueCard({ issue }: IssueCardProps): JSX.Element {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: issue.id,
    data: {
      type: "issue",
      issue,
    },
  });

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm",
        isDragging ? "opacity-40" : "opacity-100",
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          aria-label="ドラッグして移動"
          className="mt-0.5 cursor-grab rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          {...attributes}
          {...listeners}
          type="button"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <p className="truncate text-sm font-semibold">{issue.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{issue.identifier}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {issue.labels.map((label) => (
              <Badge key={label.id} variant="outline">
                {label.name}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{issue.assignee.displayName}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {new Date(issue.updatedAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
