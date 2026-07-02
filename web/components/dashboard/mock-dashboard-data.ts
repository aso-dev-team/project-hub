import type { BurndownChartPoint } from "@/components/dashboard/burndown-chart-widget";
import type { KanbanWidgetCard, KanbanWidgetColumn } from "@/components/dashboard/kanban-board-widget";
import type { MetricSummaryItem } from "@/components/dashboard/metric-summary-widget";
import type { RecentActivityItem } from "@/components/dashboard/recent-activity-widget";
import type { SprintProgressData } from "@/components/dashboard/sprint-progress-widget";

const actualPoints = [60, 58, 55, 52, 47, 47, 47, 42, 38, 32, 28, 22, 18, null];

export const mockBurndownChartData: BurndownChartPoint[] = Array.from({ length: 14 }).map((_, index) => {
  const day = index + 1;
  const ideal = Math.round(60 - (60 / 13) * index);

  return {
    actual: actualPoints[index],
    day,
    ideal,
  };
});

export const mockSprintProgressData: SprintProgressData = {
  completedPoints: 13,
  name: "スプリント 12",
  remainingDays: -19,
  targetDateLabel: "2026年3月24日",
  totalDays: 14,
  totalPoints: 60,
};

export const mockMetricSummaryData: MetricSummaryItem[] = [
  {
    color: "#94a3b8",
    description: "未着手",
    id: "todo",
    label: "未着手",
    trend: {
      direction: "down",
      label: "-5",
    },
    value: "12",
  },
  {
    color: "#3b82f6",
    description: "進行中",
    id: "in-progress",
    label: "進行中",
    trend: {
      direction: "flat",
      label: "横ばい",
    },
    value: "18",
  },
  {
    color: "#f59e0b",
    description: "レビュー待ち",
    id: "review",
    label: "レビュー",
    trend: {
      direction: "up",
      label: "+3",
    },
    value: "7",
  },
  {
    color: "#10b981",
    description: "完了",
    id: "completed",
    label: "完了",
    trend: {
      direction: "up",
      label: "+8%",
    },
    value: "24",
  },
];

export const mockRecentActivityData: RecentActivityItem[] = [
  {
    actionLabel: "を完了しました",
    actorInitials: "AK",
    actorName: "Akari",
    id: "activity-1",
    relativeTime: "1日前",
    target: "請求フロー改善",
    type: "completed",
  },
  {
    actionLabel: "を開始しました",
    actorInitials: "YT",
    actorName: "Yuto",
    id: "activity-2",
    relativeTime: "2日前",
    target: "通知設定",
    type: "started",
  },
  {
    actionLabel: "にコメントしました",
    actorInitials: "MS",
    actorName: "Mio",
    id: "activity-3",
    relativeTime: "3日前",
    target: "検索結果の改善",
    type: "commented",
  },
  {
    actionLabel: "をレビューへ移動しました",
    actorInitials: "RK",
    actorName: "Ren",
    id: "activity-4",
    relativeTime: "4日前",
    target: "ダッシュボード編集",
    type: "moved",
  },
];

export const mockKanbanData: KanbanWidgetColumn[] = [
  {
    cards: [
      {
        id: "kanban-1",
        priority: { label: "High", level: "high" },
        storyPoints: 5,
        title: "ウィジェット追加ダイアログ",
      },
      {
        id: "kanban-2",
        priority: { label: "Med", level: "medium" },
        storyPoints: 3,
        title: "フィルタ状態の保存",
      },
    ],
    id: "todo",
    title: "未着手",
  },
  {
    cards: [
      {
        id: "kanban-3",
        priority: { label: "High", level: "high" },
        storyPoints: 8,
        title: "ダッシュボード編集モード",
      },
    ],
    id: "doing",
    title: "進行中",
  },
  {
    cards: [
      {
        id: "kanban-4",
        priority: { label: "Low", level: "low" },
        storyPoints: 2,
        title: "文言調整",
      },
    ],
    id: "review",
    title: "レビュー",
  },
  {
    cards: [
      {
        id: "kanban-5",
        priority: { label: "Med", level: "medium" },
        storyPoints: 3,
        title: "プレビュー導線",
      },
    ],
    id: "done",
    title: "完了",
  },
];

export const mockHighPriorityTasksData: KanbanWidgetCard[] = mockKanbanData
  .flatMap((column) => column.cards)
  .filter((card) => card.priority.level === "critical" || card.priority.level === "high");
