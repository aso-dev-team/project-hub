import { DashboardWidget, type DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { KanbanBoardTaskCard } from "@/components/dashboard/kanban-board-task-card";
import { cn } from "@/lib/utils";

export type KanbanWidgetPriority = "critical" | "high" | "medium" | "low";

export interface KanbanWidgetCard {
  id: string;
  title: string;
  priority: {
    label: string;
    level: KanbanWidgetPriority;
  };
  storyPoints: number;
}

export interface KanbanWidgetColumn {
  id: string;
  title: string;
  cards: KanbanWidgetCard[];
}

export interface KanbanBoardWidgetProps {
  columns?: KanbanWidgetColumn[];
  className?: string;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  isLoading?: boolean;
  title?: string;
}

const skeletonColumnCardCounts = [3, 2, 1, 2];

export function KanbanBoardWidget({
  columns = [],
  className,
  dragHandleProps,
  isEditing = false,
  isLoading = false,
  title = "かんばんボード",
}: KanbanBoardWidgetProps): JSX.Element {
  const hasCards = columns.some((column) => column.cards.length > 0);

  return (
    <DashboardWidget
      className={cn(
        "min-h-[416px] w-full max-w-[915px]",
        className,
      )}
      contentClassName="px-6 pb-6 pt-2"
      dragHandleProps={dragHandleProps}
      isEditing={isEditing}
      isLoading={isLoading}
      title={title}
    >
      {isLoading ? <KanbanSkeleton /> : null}
      {!isLoading && !hasCards ? <KanbanEmptyState /> : null}
      {!isLoading && hasCards ? <KanbanColumns columns={columns} /> : null}
    </DashboardWidget>
  );
}

function KanbanColumns({ columns }: { columns: KanbanWidgetColumn[] }): JSX.Element {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-3">
        {columns.map((column) => (
          <KanbanColumn column={column} key={column.id} />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({ column }: { column: KanbanWidgetColumn }): JSX.Element {
  return (
    <section className="flex min-w-[207px] max-w-[207px] flex-col gap-2">
      <div className="flex h-5 items-center justify-between">
        <h4 className="truncate text-sm font-medium leading-5 text-foreground">{column.title}</h4>
        <span className="text-xs leading-4 text-muted-foreground">{column.cards.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {column.cards.map((card) => (
          <KanbanBoardTaskCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  );
}

function KanbanEmptyState(): JSX.Element {
  return (
    <div className="min-h-[308px] px-11 pt-6">
      <p className="text-base font-medium leading-6 text-muted-foreground">対象データがありません</p>
    </div>
  );
}

function KanbanSkeleton(): JSX.Element {
  return (
    <div aria-label="かんばんボードを読み込み中" className="overflow-x-auto pb-1" role="status">
      <div className="flex min-w-max gap-3">
        {skeletonColumnCardCounts.map((cardCount, columnIndex) => (
          <section className="flex min-w-[207px] max-w-[207px] flex-col gap-2" key={columnIndex}>
            <div className="flex h-5 items-center justify-between">
              <div className="h-4 w-12 rounded-full bg-muted-foreground/70" />
              <div className="size-2 rounded-full bg-muted-foreground/80" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: cardCount }).map((_, cardIndex) => (
                <KanbanSkeletonCard key={cardIndex} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function KanbanSkeletonCard(): JSX.Element {
  return (
    <div className="flex min-h-[71px] w-[207px] shrink-0 flex-col gap-2 rounded-[10px] border border-l-4 border-[rgba(0,0,0,0.1)] bg-white pb-3 pl-4 pr-[13px] pt-[13px] shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]">
      <div className="h-4 w-full rounded-full bg-[#898989]" />
      <div className="flex h-[22px] items-center justify-between gap-3">
        <div className="h-[22px] w-7 rounded-[8px] bg-[#030213]" />
        <div className="h-4 w-6 rounded-full bg-[#6a7282]/80" />
      </div>
    </div>
  );
}
