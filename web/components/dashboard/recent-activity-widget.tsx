import { ArrowRight, CircleCheck, CircleDot, MessageSquare, UserPlus, type LucideIcon } from "lucide-react";

import { DashboardWidget, type DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { cn } from "@/lib/utils";

export type RecentActivityType = "completed" | "started" | "moved" | "commented" | "assigned";

export interface RecentActivityItem {
  id: string;
  actorName: string;
  actorInitials: string;
  target: string;
  actionLabel: string;
  relativeTime: string;
  type: RecentActivityType;
}

interface RecentActivityWidgetProps {
  activities?: RecentActivityItem[];
  className?: string;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  isLoading?: boolean;
  title?: string;
}

interface ActivityTypeConfig {
  icon: LucideIcon;
  iconClassName: string;
}

const MAX_VISIBLE_ACTIVITIES = 6;

const activityTypeConfig: Record<RecentActivityType, ActivityTypeConfig> = {
  completed: {
    icon: CircleCheck,
    iconClassName: "text-emerald-500",
  },
  started: {
    icon: ArrowRight,
    iconClassName: "text-foreground",
  },
  moved: {
    icon: CircleDot,
    iconClassName: "text-amber-500",
  },
  commented: {
    icon: MessageSquare,
    iconClassName: "text-foreground",
  },
  assigned: {
    icon: UserPlus,
    iconClassName: "text-foreground",
  },
};

export function RecentActivityWidget({
  activities = [],
  className,
  dragHandleProps,
  isEditing = false,
  isLoading = false,
  title = "最近のアクティビティ",
}: RecentActivityWidgetProps): JSX.Element {
  const visibleActivities = activities.slice(0, MAX_VISIBLE_ACTIVITIES);

  return (
    <DashboardWidget
      className={cn(
        "min-h-[415px] w-full max-w-[495px]",
        className,
      )}
      contentClassName="px-6 pb-6 pt-[9px]"
      dragHandleProps={dragHandleProps}
      isEditing={isEditing}
      isLoading={isLoading}
      title={title}
    >
      {isLoading ? <RecentActivitySkeleton /> : null}
      {!isLoading && visibleActivities.length === 0 ? <RecentActivityEmptyState /> : null}
      {!isLoading && visibleActivities.length > 0 ? (
        <ol className="flex max-w-[444.656px] flex-col gap-3">
          {visibleActivities.map((activity) => (
            <RecentActivityRow activity={activity} key={activity.id} />
          ))}
        </ol>
      ) : null}
    </DashboardWidget>
  );
}

function RecentActivityRow({ activity }: { activity: RecentActivityItem }): JSX.Element {
  const config = activityTypeConfig[activity.type];
  const ActivityIcon = config.icon;

  return (
    <li className="grid min-h-10 min-w-0 grid-cols-[32px_1fr] gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ececf0] text-xs leading-4 text-[#0a0a0a]"
      >
        {activity.actorInitials}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-h-5 min-w-0 items-center gap-2 text-sm leading-5">
          <ActivityIcon aria-hidden="true" className={cn("size-4 shrink-0", config.iconClassName)} />
          <p className="min-w-0 flex-1 break-words">
            <span className="font-medium text-foreground">{activity.actorName}</span>
            <span className="text-muted-foreground">が</span>
            <span className="font-medium text-foreground">{activity.target}</span>
            <span className="text-muted-foreground">{activity.actionLabel}</span>
          </p>
        </div>
        <p className="ml-6 text-xs leading-4 text-[#6a7282]">{activity.relativeTime}</p>
      </div>
    </li>
  );
}

function RecentActivityEmptyState(): JSX.Element {
  return (
    <div className="flex min-h-[302px] items-start justify-center pt-1">
      <p className="pt-1 text-base font-medium leading-6 text-[#898989]">
        直近で行われたアクティビティはありません
      </p>
    </div>
  );
}

function RecentActivitySkeleton(): JSX.Element {
  return (
    <div
      aria-label="最近のアクティビティを読み込み中"
      className="flex max-w-[444.656px] flex-col gap-3"
      role="status"
    >
      {Array.from({ length: MAX_VISIBLE_ACTIVITIES }).map((_, index) => (
        <div className="grid min-h-10 grid-cols-[32px_1fr] gap-3" key={index}>
          <div className="size-8 rounded-full bg-[#ececf0]" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-h-5 items-center gap-2">
              <div className="size-4 rounded-full bg-[#898989]" />
              <div className="h-3.5 w-full max-w-[279px] rounded-[40px] bg-[#898989]" />
            </div>
            <p className="ml-6 text-xs leading-4 text-[#6a7282]">●日前</p>
          </div>
        </div>
      ))}
    </div>
  );
}
