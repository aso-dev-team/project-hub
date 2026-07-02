"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Save, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { BurndownChartWidget } from "@/components/dashboard/burndown-chart-widget";
import type { DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { HighPriorityTasksWidget } from "@/components/dashboard/high-priority-tasks-widget";
import { KanbanBoardWidget } from "@/components/dashboard/kanban-board-widget";
import { MetricSummaryWidget } from "@/components/dashboard/metric-summary-widget";
import {
  mockBurndownChartData,
  mockHighPriorityTasksData,
  mockKanbanData,
  mockMetricSummaryData,
  mockRecentActivityData,
  mockSprintProgressData,
} from "@/components/dashboard/mock-dashboard-data";
import { RecentActivityWidget } from "@/components/dashboard/recent-activity-widget";
import { SprintProgressWidget } from "@/components/dashboard/sprint-progress-widget";
import { WidgetAddDialog, type DashboardWidgetKind } from "@/components/dashboard/widget-add-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/api";

interface DashboardPageProps {
  user: SessionUser;
}

const initialDashboardWidgets: DashboardWidgetKind[] = ["sprint-progress", "burndown"];

const addableDashboardWidgets: { id: DashboardWidgetKind; title: string }[] = [
  { id: "burndown", title: "バーンダウンチャート" },
  { id: "task-summary", title: "タスク状況サマリー" },
  { id: "recent-activity", title: "最近のアクティビティ" },
  { id: "kanban", title: "かんばんボード" },
  { id: "sprint-progress", title: "スプリント進捗" },
  { id: "high-priority-tasks", title: "優先度の高いタスク" },
];

const dashboardWidgetsStorageKey = "project-hub:dashboard:widgets";
const addableDashboardWidgetIds = new Set<DashboardWidgetKind>(addableDashboardWidgets.map((widget) => widget.id));

function parseStoredDashboardWidgets(value: string | null): DashboardWidgetKind[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    const widgets = parsedValue.filter(
      (widgetId): widgetId is DashboardWidgetKind =>
        typeof widgetId === "string" && addableDashboardWidgetIds.has(widgetId as DashboardWidgetKind),
    );
    const uniqueWidgets = Array.from(new Set(widgets));

    return uniqueWidgets.length > 0 ? uniqueWidgets : null;
  } catch {
    return null;
  }
}

function subscribeDashboardWidgetsStorage(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}

function getDashboardWidgetsStorageSnapshot(): string | null {
  return localStorage.getItem(dashboardWidgetsStorageKey);
}

function getDashboardWidgetsStorageServerSnapshot(): string | null {
  return null;
}

export function DashboardPage({ user }: DashboardPageProps): JSX.Element {
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [isWidgetAddDialogOpen, setIsWidgetAddDialogOpen] = useState(false);
  const storedDashboardWidgetsValue = useSyncExternalStore(
    subscribeDashboardWidgetsStorage,
    getDashboardWidgetsStorageSnapshot,
    getDashboardWidgetsStorageServerSnapshot,
  );
  const storedDashboardWidgets = useMemo(
    () => parseStoredDashboardWidgets(storedDashboardWidgetsValue),
    [storedDashboardWidgetsValue],
  );
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetKind[] | null>(null);
  const placedDashboardWidgets = dashboardWidgets ?? storedDashboardWidgets ?? initialDashboardWidgets;
  const [editingDashboardWidgets, setEditingDashboardWidgets] = useState<DashboardWidgetKind[]>(initialDashboardWidgets);
  const dndSensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addWidget = (widgetId: DashboardWidgetKind) => {
    setEditingDashboardWidgets((currentWidgets) => {
      if (currentWidgets.includes(widgetId)) {
        return currentWidgets;
      }

      return [...currentWidgets, widgetId];
    });
    setIsWidgetAddDialogOpen(false);
  };

  const handleWidgetDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setEditingDashboardWidgets((currentWidgets) => {
      const activeIndex = currentWidgets.indexOf(active.id as DashboardWidgetKind);
      const overIndex = currentWidgets.indexOf(over.id as DashboardWidgetKind);

      if (activeIndex === -1 || overIndex === -1) {
        return currentWidgets;
      }

      return arrayMove(currentWidgets, activeIndex, overIndex);
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-6 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1504px] flex-col gap-6">
        <section
          aria-label={`${user.displayName}のダッシュボード`}
          className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <div className="flex min-h-8 items-center gap-2">
              <h1 className="text-2xl font-semibold leading-8 text-foreground">ダッシュボード</h1>
              {isEditingDashboard ? (
                <span className="inline-flex h-[22px] items-center rounded-lg bg-[#eceef2] px-[9px] py-[3px] text-xs font-medium leading-4 text-[#030213]">
                  編集モード
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-5 text-[#4a5565]">
              {isEditingDashboard
                ? "ウィジェットをドラッグ＆ドロップしてダッシュボードをカスタマイズ"
                : `${user.displayName} のプロジェクト状況を確認`}
            </p>
          </div>
          {isEditingDashboard ? (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Button
                className="w-fit bg-white text-foreground shadow-sm"
                onClick={() => setIsWidgetAddDialogOpen(true)}
                size="sm"
                variant="outline"
              >
                ウィジェットを追加
              </Button>
              <Button
                className="w-fit gap-2 bg-white text-foreground shadow-sm"
                onClick={() => {
                  setEditingDashboardWidgets(placedDashboardWidgets);
                  setIsEditingDashboard(false);
                  setIsWidgetAddDialogOpen(false);
                }}
                size="sm"
                variant="outline"
              >
                <X aria-hidden="true" className="size-4" />
                キャンセル
              </Button>
              <Button
                className="w-fit gap-2 shadow-sm"
                onClick={() => {
                  setDashboardWidgets(editingDashboardWidgets);
                  // TODO: 正式リリース前にDB保存へ移し、localStorage依存をなくす。
                  localStorage.setItem(dashboardWidgetsStorageKey, JSON.stringify(editingDashboardWidgets));
                  setIsEditingDashboard(false);
                  setIsWidgetAddDialogOpen(false);
                }}
                size="sm"
              >
                <Save aria-hidden="true" className="size-4" />
                保存
              </Button>
            </div>
          ) : (
            <Button
              className="w-fit gap-2 self-start"
              onClick={() => {
                setEditingDashboardWidgets(placedDashboardWidgets);
                setIsEditingDashboard(true);
              }}
              size="sm"
            >
              <Pencil aria-hidden="true" className="size-4" />
              編集
            </Button>
          )}
        </section>
        {isEditingDashboard ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleWidgetDragEnd} sensors={dndSensors}>
            <SortableContext items={editingDashboardWidgets} strategy={rectSortingStrategy}>
              <DashboardEditDropZone>
                {editingDashboardWidgets.map((widgetId) => (
                  <SortableDashboardWidget key={widgetId} widgetId={widgetId} />
                ))}
              </DashboardEditDropZone>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex min-w-0 flex-wrap gap-4">
            {placedDashboardWidgets.map((widgetId) => (
              <DashboardWidgetRenderer key={widgetId} widgetId={widgetId} />
            ))}
          </div>
        )}
      </div>
      <WidgetAddDialog
        onOpenChange={setIsWidgetAddDialogOpen}
        onSelectWidget={addWidget}
        open={isWidgetAddDialogOpen}
        options={addableDashboardWidgets.map((widget) => ({
          ...widget,
          isPlaced: editingDashboardWidgets.includes(widget.id),
        }))}
      />
    </main>
  );
}

function DashboardEditDropZone({ children }: { children?: ReactNode }): JSX.Element {
  const hasWidgets = Boolean(children);

  return (
    <section className="min-h-[707px] min-w-0 overflow-x-hidden rounded-[10px] border-2 border-dashed border-[#d1d5dc] bg-[#f9fafb] px-3 py-8 sm:px-6 sm:py-12 lg:px-12">
      <div className="mx-auto flex max-w-[1380px] flex-col items-center text-center">
        <h2 className="text-lg font-semibold leading-7 text-[#364153]">ウィジェット配置エリア</h2>
        <p className="text-sm leading-5 text-[#6a7282]">
          下のツールバーからウィジェットを追加するか、既存のウィジェットをドラッグして並び替えてください
        </p>
      </div>
      {hasWidgets ? <div className="mt-4 flex min-w-0 flex-wrap items-start gap-4">{children}</div> : null}
    </section>
  );
}

function SortableDashboardWidget({ widgetId }: { widgetId: DashboardWidgetKind }): JSX.Element {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: widgetId,
  });

  return (
    <div
      className={cn(
        "w-full min-w-0 touch-manipulation",
        getDashboardWidgetWidthClass(widgetId),
        isDragging && "relative z-10 opacity-60",
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <DashboardWidgetRenderer
        dragHandleProps={{
          ...attributes,
          ...listeners,
          ref: setActivatorNodeRef,
        }}
        isEditing
        widgetId={widgetId}
      />
    </div>
  );
}

function getDashboardWidgetWidthClass(widgetId: DashboardWidgetKind): string {
  if (widgetId === "burndown" || widgetId === "kanban") {
    return "max-w-[915px]";
  }

  if (widgetId === "recent-activity") {
    return "max-w-[495px]";
  }

  return "max-w-[449px]";
}

function DashboardWidgetRenderer({
  dragHandleProps,
  isEditing = false,
  widgetId,
}: {
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  widgetId: DashboardWidgetKind;
}): JSX.Element {
  if (widgetId === "sprint-progress") {
    return (
      <SprintProgressWidget
        className="max-w-[449px]"
        data={mockSprintProgressData}
        dragHandleProps={dragHandleProps}
        isEditing={isEditing}
      />
    );
  }

  if (widgetId === "burndown") {
    return (
      <BurndownChartWidget
        className="max-w-[915px]"
        data={mockBurndownChartData}
        dragHandleProps={dragHandleProps}
        isEditing={isEditing}
      />
    );
  }

  if (widgetId === "task-summary") {
    return (
      <MetricSummaryWidget
        className="max-w-[449px]"
        dragHandleProps={dragHandleProps}
        isEditing={isEditing}
        metrics={mockMetricSummaryData}
        title="タスク状況サマリー"
      />
    );
  }

  if (widgetId === "recent-activity") {
    return (
      <RecentActivityWidget
        activities={mockRecentActivityData}
        className="max-w-[495px]"
        dragHandleProps={dragHandleProps}
        isEditing={isEditing}
      />
    );
  }

  if (widgetId === "kanban") {
    return (
      <KanbanBoardWidget
        className="max-w-[915px]"
        columns={mockKanbanData}
        dragHandleProps={dragHandleProps}
        isEditing={isEditing}
      />
    );
  }

  return (
    <HighPriorityTasksWidget
      className="max-w-[449px]"
      dragHandleProps={dragHandleProps}
      isEditing={isEditing}
      tasks={mockHighPriorityTasksData}
    />
  );
}
