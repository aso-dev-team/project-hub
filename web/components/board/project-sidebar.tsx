"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { FolderKanban } from "lucide-react";
import { useMemo, useRef } from "react";

import type { ProjectSummary } from "@/types/api";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  activeProjectId: string;
  onSelect: (projectId: string) => void;
  projects: ProjectSummary[];
}

export function ProjectSidebar(props: ProjectSidebarProps): JSX.Element {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const sortedProjects = useMemo(
    () => [...props.projects].sort((left, right) => left.name.localeCompare(right.name)),
    [props.projects],
  );

  // TanStack Virtual exposes runtime functions here by design.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: sortedProjects.length,
    estimateSize: () => 52,
    getScrollElement: () => parentRef.current,
    overscan: 6,
  });

  return (
    <aside className="hidden w-72 shrink-0 rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur-sm lg:flex lg:flex-col">
      <div className="mb-3 flex items-center gap-2 px-2">
        <FolderKanban className="size-4 text-primary" />
        <div>
          <p className="text-sm font-semibold">Projects</p>
          <p className="text-xs text-muted-foreground">react-virtual で描画</p>
        </div>
      </div>
      <div className="relative h-[calc(100vh-10rem)] overflow-auto" ref={parentRef}>
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const project = sortedProjects[virtualItem.index];

            return (
              <button
                className={cn(
                  "absolute left-0 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent",
                  project.id === props.activeProjectId ? "bg-primary/8 text-primary" : "text-foreground",
                )}
                key={project.id}
                onClick={() => props.onSelect(project.id)}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                type="button"
              >
                <div>
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.key}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {project.issueCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
