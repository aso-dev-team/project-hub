import { DashboardWidget, type DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { KanbanBoardTaskCard } from "@/components/dashboard/kanban-board-task-card";
import type { KanbanWidgetCard } from "@/components/dashboard/kanban-board-widget";
import { cn } from "@/lib/utils";

export interface HighPriorityTasksWidgetProps {
  className?: string;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  isLoading?: boolean;
  tasks?: KanbanWidgetCard[];
  title?: string;
}

const skeletonTaskCount = 3;

export function HighPriorityTasksWidget({
  className,
  dragHandleProps,
  isEditing = false,
  isLoading = false,
  tasks = [],
  title = "優先度の高いタスク",
}: HighPriorityTasksWidgetProps): JSX.Element {
  return (
    <DashboardWidget
      className={cn("min-h-[416px] w-full max-w-[449px]", className)}
      contentClassName="px-6 pb-6 pt-2"
      dragHandleProps={dragHandleProps}
      isEditing={isEditing}
      isLoading={isLoading}
      title={title}
    >
      {isLoading ? <HighPriorityTasksSkeleton /> : null}
      {!isLoading && tasks.length === 0 ? <HighPriorityTasksEmptyState /> : null}
      {!isLoading && tasks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tasks.slice(0, 3).map((task) => (
            <KanbanBoardTaskCard card={task} className="w-full" key={task.id} />
          ))}
        </div>
      ) : null}
    </DashboardWidget>
  );
}

function HighPriorityTasksEmptyState(): JSX.Element {
  return (
    <div className="flex min-h-[300px] items-start justify-center pt-6">
      <p className="text-base font-medium leading-6 text-muted-foreground">優先度の高いタスクはありません</p>
    </div>
  );
}

function HighPriorityTasksSkeleton(): JSX.Element {
  return (
    <div aria-label="優先度の高いタスクを読み込み中" className="flex flex-col gap-3" role="status">
      {Array.from({ length: skeletonTaskCount }).map((_, index) => (
        <div
          className="min-h-[78px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white px-[13px] py-[13px] shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]"
          key={index}
        >
          <div className="h-5 w-full max-w-[315px] rounded-[40px] bg-[#898989]" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-[22px] w-7 rounded-lg bg-[#030213]" />
              <div className="h-3 w-[38px] rounded-[40px] bg-[#898989]" />
            </div>
            <div className="size-6 rounded-full bg-[#ececf0]" />
          </div>
        </div>
      ))}
    </div>
  );
}
