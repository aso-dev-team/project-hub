"use client";

import { ChartPie, ListChecks, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { DashboardWidget, type DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { cn } from "@/lib/utils";

export type MetricSummaryTrend = "up" | "down" | "flat";
type MetricSummaryDisplayMode = "chart" | "numbers";

export interface MetricSummaryItem {
  id: string;
  label: string;
  value: string;
  color?: string;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    direction: MetricSummaryTrend;
    label: string;
  };
}

export interface MetricSummaryWidgetProps {
  className?: string;
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  isLoading?: boolean;
  metrics?: MetricSummaryItem[];
  title?: string;
}

interface MetricSummaryChartSegment {
  color: string;
  id: string;
  label: string;
  value: number;
}

const defaultSegmentColorById: Record<string, string> = {
  completed: "#10b981",
  done: "#10b981",
  "in-progress": "#3b82f6",
  review: "#f59e0b",
  todo: "#94a3b8",
};

const fallbackSegmentColors = ["#94a3b8", "#3b82f6", "#f59e0b", "#10b981"];
const chartRadius = 72;
const chartStrokeWidth = 32;
const chartCircumference = 2 * Math.PI * chartRadius;
const segmentGap = 5;

export function MetricSummaryWidget({
  className,
  dragHandleProps,
  isEditing = false,
  isLoading = false,
  metrics = [],
  title = "サマリー",
}: MetricSummaryWidgetProps): JSX.Element {
  const [displayMode, setDisplayMode] = useState<MetricSummaryDisplayMode>("chart");
  const headerAction = isEditing ? undefined : (
    <MetricSummaryDisplayModeToggle mode={displayMode} onModeChange={setDisplayMode} />
  );

  return (
    <DashboardWidget
      className={cn("min-h-[416px] w-full max-w-[449px]", className)}
      contentClassName="px-6 pb-6 pt-2"
      dragHandleProps={dragHandleProps}
      headerAction={headerAction}
      isEditing={isEditing}
      isLoading={isLoading}
      title={title}
    >
      {isLoading ? <MetricSummarySkeleton /> : null}
      {!isLoading && metrics.length === 0 ? <MetricSummaryEmptyState /> : null}
      {!isLoading && metrics.length > 0 && displayMode === "chart" ? (
        <MetricSummaryDonutChart metrics={metrics} />
      ) : null}
      {!isLoading && metrics.length > 0 && displayMode === "numbers" ? (
        <MetricSummaryNumbers metrics={metrics} />
      ) : null}
    </DashboardWidget>
  );
}

function MetricSummaryDisplayModeToggle({
  mode,
  onModeChange,
}: {
  mode: MetricSummaryDisplayMode;
  onModeChange: (mode: MetricSummaryDisplayMode) => void;
}): JSX.Element {
  return (
    <div
      aria-label="タスク状況サマリーの表示形式"
      className="inline-flex h-8 shrink-0 items-center rounded-lg border border-[rgba(0,0,0,0.1)] bg-white p-0.5"
      role="group"
    >
      <button
        aria-pressed={mode === "chart"}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-[#6a7282] transition-colors hover:bg-[#f3f4f6] hover:text-[#0a0a0a]",
          mode === "chart" && "bg-[#030213] text-white hover:bg-[#030213] hover:text-white",
        )}
        onClick={() => onModeChange("chart")}
        title="円グラフ表示"
        type="button"
      >
        <ChartPie aria-hidden="true" className="size-4" />
        <span className="sr-only">円グラフ表示</span>
      </button>
      <button
        aria-pressed={mode === "numbers"}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-[#6a7282] transition-colors hover:bg-[#f3f4f6] hover:text-[#0a0a0a]",
          mode === "numbers" && "bg-[#030213] text-white hover:bg-[#030213] hover:text-white",
        )}
        onClick={() => onModeChange("numbers")}
        title="数値表示"
        type="button"
      >
        <ListChecks aria-hidden="true" className="size-4" />
        <span className="sr-only">数値表示</span>
      </button>
    </div>
  );
}

function MetricSummaryDonutChart({ metrics }: { metrics: MetricSummaryItem[] }): JSX.Element {
  const segments = toChartSegments(metrics);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (segments.length === 0 || total <= 0) {
    return <MetricSummaryEmptyState />;
  }

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-start pt-5">
      <svg
        aria-label={`タスク状況サマリー 合計 ${total} 件`}
        className="size-[224px]"
        role="img"
        viewBox="0 0 224 224"
      >
        <circle
          className="text-[#eef2f7]"
          cx="112"
          cy="112"
          fill="none"
          r={chartRadius}
          stroke="currentColor"
          strokeWidth={chartStrokeWidth}
        />
        {segments.map((segment, index) => {
          const previousTotal = segments.slice(0, index).reduce((sum, item) => sum + item.value, 0);
          const segmentLength = Math.max((segment.value / total) * chartCircumference - segmentGap, 0);
          const dashOffset = -((previousTotal / total) * chartCircumference);

          return (
            <circle
              cx="112"
              cy="112"
              fill="none"
              key={segment.id}
              r={chartRadius}
              stroke={segment.color}
              strokeDasharray={`${segmentLength} ${chartCircumference - segmentLength}`}
              strokeDashoffset={dashOffset}
              strokeWidth={chartStrokeWidth}
              transform="rotate(-90 112 112)"
            >
              <title>
                {segment.label}: {segment.value}
              </title>
            </circle>
          );
        })}
        <circle cx="112" cy="112" fill="white" r={chartRadius - chartStrokeWidth / 2} />
      </svg>
      <ul className="mt-[22px] flex flex-wrap items-center justify-center gap-x-[15px] gap-y-2">
        {segments.map((segment) => (
          <li className="inline-flex items-center gap-1.5 text-xs leading-[18px]" key={segment.id}>
            <span
              aria-hidden="true"
              className="size-[14px] shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span style={{ color: segment.color }}>{segment.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetricSummaryNumbers({ metrics }: { metrics: MetricSummaryItem[] }): JSX.Element {
  return (
    <dl className="grid min-h-[300px] content-start gap-3 sm:grid-cols-2">
      {metrics.map((metric, index) => (
        <MetricSummaryNumberCell key={metric.id} metric={metric} segmentColor={getMetricColor(metric, index)} />
      ))}
    </dl>
  );
}

function MetricSummaryNumberCell({
  metric,
  segmentColor,
}: {
  metric: MetricSummaryItem;
  segmentColor: string;
}): JSX.Element {
  return (
    <div className="min-h-[116px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <dt className="truncate text-sm font-medium leading-5 text-muted-foreground">{metric.label}</dt>
        <span aria-hidden="true" className="size-3.5 shrink-0" style={{ backgroundColor: segmentColor }} />
      </div>
      <dd className="mt-3 min-w-0 text-3xl font-semibold leading-9 text-foreground">{metric.value}</dd>
      {metric.description ? (
        <p className="mt-2 min-h-5 truncate text-xs leading-4 text-muted-foreground">{metric.description}</p>
      ) : null}
    </div>
  );
}

function MetricSummaryEmptyState(): JSX.Element {
  return (
    <div className="flex min-h-[300px] items-start pt-2">
      <p className="text-base font-medium leading-6 text-[#898989]">対象データがありません</p>
    </div>
  );
}

function MetricSummarySkeleton(): JSX.Element {
  return (
    <div
      aria-label="タスク状況サマリーを読み込み中"
      className="flex min-h-[300px] flex-col items-center justify-start pt-5"
      role="status"
    >
      <div className="size-[180px] rounded-full border-[32px] border-[#898989]/40 border-b-[#898989]/70 border-l-[#898989]/60" />
    </div>
  );
}

function toChartSegments(metrics: MetricSummaryItem[]): MetricSummaryChartSegment[] {
  return metrics
    .map((metric, index) => ({
      color: getMetricColor(metric, index),
      id: metric.id,
      label: metric.label,
      value: Number.parseFloat(metric.value),
    }))
    .filter((segment) => Number.isFinite(segment.value) && segment.value > 0);
}

function getMetricColor(metric: MetricSummaryItem, index: number): string {
  return metric.color ?? defaultSegmentColorById[metric.id] ?? fallbackSegmentColors[index % fallbackSegmentColors.length];
}
