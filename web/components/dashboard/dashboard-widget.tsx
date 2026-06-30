import { Grip } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardWidgetDragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
};

export interface DashboardWidgetProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  headerAction?: ReactNode;
  isEditing?: boolean;
  isLoading?: boolean;
  title: string;
}

export function DashboardWidget({
  children,
  className,
  contentClassName,
  dragHandleProps,
  headerAction,
  isEditing = false,
  isLoading = false,
  title,
}: DashboardWidgetProps): JSX.Element {
  return (
    <Card
      aria-busy={isLoading}
      className={cn(
        "group rounded-[14px] border-2 border-[rgba(0,0,0,0.1)] bg-white shadow-none transition-[border-color,box-shadow]",
        "hover:border-[#d1d5dc] hover:shadow-[0_4px_2px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      <CardHeader className="flex-row items-center justify-between px-6 pb-4 pt-6">
        <CardTitle className="text-base font-medium leading-6 tracking-normal">{title}</CardTitle>
        {headerAction ?? <DashboardWidgetDragHandle dragHandleProps={dragHandleProps} isVisible={isEditing} />}
      </CardHeader>
      <CardContent className={cn("px-6 pb-6 pt-2", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function DashboardWidgetDragHandle({
  className,
  dragHandleProps,
  isVisible = false,
}: {
  className?: string;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isVisible?: boolean;
}): JSX.Element {
  const { className: dragHandleClassName, ...restDragHandleProps } = dragHandleProps ?? {};

  return (
    <button
      aria-label="ドラッグしてウィジェットを移動"
      className={cn(
        "inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-[#99a1af] opacity-0 transition-[background-color,color,opacity]",
        "hover:bg-[#f3f4f6] hover:text-[#4a5565] active:cursor-grabbing group-hover:opacity-100",
        isVisible && "opacity-100",
        className,
        dragHandleClassName,
      )}
      type="button"
      {...restDragHandleProps}
    >
      <Grip aria-hidden="true" className="size-5" />
    </button>
  );
}
