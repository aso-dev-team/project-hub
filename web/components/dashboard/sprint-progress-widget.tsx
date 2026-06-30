import { CalendarDays, Target } from "lucide-react";

import { DashboardWidget, type DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { cn } from "@/lib/utils";

export interface SprintProgressData {
  completedPoints: number;
  name: string;
  remainingDays: number;
  targetDateLabel: string;
  totalDays: number;
  totalPoints: number;
}

export interface SprintProgressWidgetProps {
  className?: string;
  data?: SprintProgressData | null;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  isLoading?: boolean;
  title?: string;
}

export function SprintProgressWidget({
  className,
  data,
  dragHandleProps,
  isEditing = false,
  isLoading = false,
  title = "スプリント進捗",
}: SprintProgressWidgetProps): JSX.Element {
  const hasData = Boolean(data && data.totalPoints > 0);

  return (
    <DashboardWidget
      className={cn("min-h-[200px] w-full max-w-[449px]", className)}
      contentClassName="px-6 pb-6 pt-0"
      dragHandleProps={dragHandleProps}
      isEditing={isEditing}
      isLoading={isLoading}
      title={title}
    >
      {isLoading ? <SprintProgressSkeleton /> : null}
      {!isLoading && !hasData ? <SprintProgressEmptyState /> : null}
      {!isLoading && hasData && data ? <SprintProgressContent data={data} /> : null}
    </DashboardWidget>
  );
}

function SprintProgressContent({ data }: { data: SprintProgressData }): JSX.Element {
  const progressPercent = clampProgress((data.completedPoints / data.totalPoints) * 100);

  return (
    <div className="flex min-h-[108px] flex-col justify-between pt-5">
      <div className="flex flex-col gap-2">
        <div className="flex min-h-[27px] items-center justify-between gap-4">
          <h3 className="truncate text-lg font-semibold leading-[27px] text-[#0a0a0a]">{data.name}</h3>
          <p className="shrink-0 text-sm leading-5 text-[#4a5565]">
            {data.completedPoints} / {data.totalPoints} ポイント
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(3,2,19,0.2)]">
          <div
            className="h-full rounded-full bg-[#030213]"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-5 text-[#4a5565]">
        <span className="inline-flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-[#6a7282]" />
          残り {data.remainingDays} 日 / 全 {data.totalDays} 日
        </span>
        <span className="inline-flex items-center gap-2">
          <Target aria-hidden="true" className="size-4 shrink-0 text-[#6a7282]" />
          {data.targetDateLabel}
        </span>
      </div>
    </div>
  );
}

function SprintProgressEmptyState(): JSX.Element {
  return (
    <div className="min-h-[112px] pt-5">
      <p className="text-base font-medium leading-6 text-[#898989]">対象データがありません</p>
    </div>
  );
}

function SprintProgressSkeleton(): JSX.Element {
  return (
    <div aria-label="スプリント進捗を読み込み中" className="flex min-h-[108px] flex-col justify-between pt-5" role="status">
      <div className="flex flex-col gap-2">
        <div className="flex min-h-[27px] items-center justify-between gap-4">
          <h3 className="text-lg font-semibold leading-[27px] text-[#0a0a0a]">スプリント ●</h3>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(3,2,19,0.2)]">
          <div className="h-full w-[22%] rounded-full bg-[#030213]" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-5 text-[#4a5565]">
        <span className="inline-flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-[#6a7282]" />
          残り
          <span className="h-[14px] w-[100px] rounded-[40px] bg-[#898989]" />
        </span>
        <span className="inline-flex items-center gap-2">
          <Target aria-hidden="true" className="size-4 shrink-0 text-[#6a7282]" />
          <span className="h-[14px] w-[111px] rounded-[40px] bg-[#898989]" />
        </span>
      </div>
    </div>
  );
}

function clampProgress(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}
