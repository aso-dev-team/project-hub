"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardWidgetKind =
  | "burndown"
  | "task-summary"
  | "recent-activity"
  | "kanban"
  | "sprint-progress"
  | "high-priority-tasks";

export interface WidgetAddDialogOption {
  id: DashboardWidgetKind;
  isPlaced: boolean;
  title: string;
}

export interface WidgetAddDialogProps {
  onOpenChange: (open: boolean) => void;
  onSelectWidget: (widgetId: DashboardWidgetKind) => void;
  open: boolean;
  options: WidgetAddDialogOption[];
}

export function WidgetAddDialog({
  onOpenChange,
  onSelectWidget,
  open,
  options,
}: WidgetAddDialogProps): JSX.Element {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/10" />
        <DialogPrimitive.Content className="fixed bottom-0 left-1/2 z-50 flex w-[min(100vw-1rem,1292px)] -translate-x-1/2 flex-col border-t border-[rgba(0,0,0,0.1)] bg-white shadow-[0_10px_7.5px_rgba(0,0,0,0.1),0_4px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-6 py-2">
            <div className="flex min-w-0 items-center gap-4">
              <DialogPrimitive.Title className="text-lg font-semibold leading-7 text-[#0a0a0a]">
                追加可能なウィジェット
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="hidden text-sm font-bold leading-5 text-[#6a7282] sm:block">
                ウィジェットを選択して追加してください
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium leading-5 text-[#0a0a0a] transition-colors hover:bg-[#f3f4f6]">
              <ChevronDown aria-hidden="true" className="size-4" />
              閉じる
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-x-auto p-5">
            <div className="flex min-w-max gap-4">
              {options.map((option) => (
                <button
                  aria-label={`${option.title}を追加`}
                  className={cn(
                    "group flex h-[152px] w-48 shrink-0 flex-col items-center justify-between rounded-[10px] bg-[#898989]/[0.02] px-3 pb-0 pt-4 text-center transition-colors hover:bg-[#f3f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    option.isPlaced && "opacity-55",
                  )}
                  disabled={option.isPlaced}
                  key={option.id}
                  onClick={() => onSelectWidget(option.id)}
                  type="button"
                >
                  <WidgetPreview kind={option.id} />
                  <span className="text-xs font-medium leading-4 text-[#0a0a0a]">
                    {option.isPlaced ? `${option.title}（配置済み）` : option.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[45px] items-center justify-end border-b border-[rgba(0,0,0,0.1)]">
            <div className="mr-3 h-8 w-8 rotate-45 border-b-2 border-r-2 border-[#99a1af]" aria-hidden="true" />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function WidgetPreview({ kind }: { kind: DashboardWidgetKind }): JSX.Element {
  if (kind === "burndown") {
    return <BurndownPreview />;
  }

  if (kind === "task-summary") {
    return <TaskSummaryPreview />;
  }

  if (kind === "recent-activity") {
    return <RecentActivityPreview />;
  }

  if (kind === "kanban") {
    return <KanbanPreview />;
  }

  if (kind === "sprint-progress") {
    return <SprintProgressPreview />;
  }

  return <HighPriorityTasksPreview />;
}

function PreviewFrame({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        "flex h-[88px] w-[150px] items-center justify-center rounded border border-[#d1d5dc] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BurndownPreview(): JSX.Element {
  return (
    <PreviewFrame>
      <svg aria-hidden="true" className="h-16 w-32 text-[#6a7282]" viewBox="0 0 128 64">
        {Array.from({ length: 6 }).map((_, index) => (
          <line key={`v-${index}`} stroke="#e5e7eb" strokeDasharray="2 2" x1={12 + index * 21} x2={12 + index * 21} y1="8" y2="52" />
        ))}
        {Array.from({ length: 4 }).map((_, index) => (
          <line key={`h-${index}`} stroke="#e5e7eb" strokeDasharray="2 2" x1="12" x2="118" y1={12 + index * 13} y2={12 + index * 13} />
        ))}
        <polyline fill="none" points="12,10 36,20 58,25 78,34 100,43 118,51" stroke="#898989" strokeWidth="2" />
        <polyline fill="none" points="12,12 118,52" stroke="#94a3b8" strokeDasharray="3 3" />
      </svg>
    </PreviewFrame>
  );
}

function TaskSummaryPreview(): JSX.Element {
  return (
    <PreviewFrame className="w-[100px]">
      <div className="size-14 rounded-full border-[10px] border-[#99a9bf] border-b-[#898989] border-l-[#a3a3a3]" />
    </PreviewFrame>
  );
}

function RecentActivityPreview(): JSX.Element {
  return (
    <PreviewFrame className="w-[118px]">
      <div className="flex w-20 flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="flex items-center gap-2" key={index}>
            <span className="size-2 rounded-full bg-[#ececf0]" />
            <span className="h-1.5 flex-1 rounded-full bg-[#898989]" />
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function KanbanPreview(): JSX.Element {
  return (
    <PreviewFrame className="w-[150px]">
      <div className="grid w-32 grid-cols-4 gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <span className="h-5 rounded-sm border border-[#d1d5dc] bg-white shadow-sm" key={index}>
            <span className="mx-auto mt-1 block h-1 w-5 rounded-full bg-[#898989]" />
          </span>
        ))}
      </div>
    </PreviewFrame>
  );
}

function SprintProgressPreview(): JSX.Element {
  return (
    <PreviewFrame className="w-[138px]">
      <div className="w-24">
        <div className="mb-3 h-2 w-16 rounded-full bg-[#030213]" />
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(3,2,19,0.2)]">
          <div className="h-full w-2/3 bg-[#030213]" />
        </div>
        <div className="mt-3 flex gap-2">
          <span className="h-1.5 w-8 rounded-full bg-[#898989]" />
          <span className="h-1.5 w-10 rounded-full bg-[#898989]" />
        </div>
      </div>
    </PreviewFrame>
  );
}

function HighPriorityTasksPreview(): JSX.Element {
  return (
    <PreviewFrame className="w-[112px]">
      <div className="flex w-20 flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded border border-[#d1d5dc] bg-white p-1 shadow-sm" key={index}>
            <span className="block h-1.5 rounded-full bg-[#898989]" />
            <span className="mt-1 block h-1.5 w-5 rounded bg-[#030213]" />
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}
