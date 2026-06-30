import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KanbanWidgetCard, KanbanWidgetPriority } from "@/components/dashboard/kanban-board-widget";

export interface KanbanBoardTaskCardProps {
  card: KanbanWidgetCard;
  className?: string;
}

const priorityClassName: Record<KanbanWidgetPriority, string> = {
  critical: "border-transparent bg-[#d4183d] text-white",
  high: "border-transparent bg-[#030213] text-white",
  medium: "border-transparent bg-[#eceef2] text-[#030213]",
  low: "border-[rgba(0,0,0,0.1)] bg-white text-[#030213]",
};

export function KanbanBoardTaskCard({ card, className }: KanbanBoardTaskCardProps): JSX.Element {
  return (
    <article
      className={cn(
        "flex min-h-[71px] w-[207px] shrink-0 flex-col gap-2 rounded-[10px] border border-l-4 border-[rgba(0,0,0,0.1)] bg-white pb-3 pl-4 pr-[13px] pt-[13px] shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      <p className="min-h-4 w-[178px] break-words text-sm font-medium leading-4 text-black">{card.title}</p>
      <div className="flex h-[22px] w-full items-center justify-between gap-3">
        <Badge
          className={cn(
            "h-[22px] rounded-[8px] px-2 py-0 text-xs font-normal leading-4",
            priorityClassName[card.priority.level],
          )}
        >
          {card.priority.label}
        </Badge>
        <span className="shrink-0 text-xs leading-4 text-[#6a7282]">{card.storyPoints}pt</span>
      </div>
    </article>
  );
}
