import { DashboardWidget, type DashboardWidgetDragHandleProps } from "@/components/dashboard/dashboard-widget";
import { cn } from "@/lib/utils";

export interface BurndownChartPoint {
  actual?: number | null;
  day: number;
  ideal: number;
}

export interface BurndownChartWidgetProps {
  className?: string;
  data?: BurndownChartPoint[];
  dragHandleProps?: DashboardWidgetDragHandleProps;
  isEditing?: boolean;
  isLoading?: boolean;
  title?: string;
}

interface ChartPoint {
  x: number;
  y: number;
}

const chartWidth = 862.672;
const chartHeight = 300;
const plotLeft = 60;
const plotRight = 18;
const plotTop = 10;
const plotBottom = 58;
const maxDay = 14;
const maxValue = 60;
const yTicks = [0, 15, 30, 45, 60];

const plotWidth = chartWidth - plotLeft - plotRight;
const plotHeight = chartHeight - plotTop - plotBottom;

export function BurndownChartWidget({
  className,
  data = [],
  dragHandleProps,
  isEditing = false,
  isLoading = false,
  title = "バーンダウンチャート",
}: BurndownChartWidgetProps): JSX.Element {
  const hasData = data.length > 0;

  return (
    <DashboardWidget
      className={cn("min-h-[416px] w-full max-w-[915px]", className)}
      contentClassName="px-6 pb-6 pt-2"
      dragHandleProps={dragHandleProps}
      isEditing={isEditing}
      isLoading={isLoading}
      title={title}
    >
      {isLoading ? <BurndownChartSkeleton /> : null}
      {!isLoading && !hasData ? <BurndownChartEmptyState /> : null}
      {!isLoading && hasData ? <BurndownChart data={data} /> : null}
    </DashboardWidget>
  );
}

function BurndownChart({ data }: { data: BurndownChartPoint[] }): JSX.Element {
  const orderedData = [...data].sort((left, right) => left.day - right.day);
  const idealPoints = orderedData.map((point) => toChartPoint(point.day, point.ideal));
  const actualPoints = orderedData
    .filter((point) => point.actual !== null && point.actual !== undefined)
    .map((point) => toChartPoint(point.day, point.actual ?? 0));

  return (
    <div className="h-[300px] w-full overflow-x-auto">
      <svg
        aria-label="バーンダウンチャート"
        className="block h-[300px] min-w-[862.672px] text-[#6b7280]"
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <g>
          {yTicks.map((tick) => {
            const y = valueToY(tick);
            return (
              <g key={tick}>
                <line
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1={plotLeft}
                  x2={chartWidth - plotRight}
                  y1={y}
                  y2={y}
                />
                <text
                  dominantBaseline="middle"
                  fill="#6b7280"
                  fontSize="12"
                  textAnchor="end"
                  x={plotLeft - 10}
                  y={y}
                >
                  {tick}
                </text>
              </g>
            );
          })}
        </g>
        <g>
          {Array.from({ length: maxDay }).map((_, index) => {
            const day = index + 1;
            const x = dayToX(day);
            return (
              <g key={day}>
                <line
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1={x}
                  x2={x}
                  y1={plotTop}
                  y2={plotTop + plotHeight}
                />
                <text fill="#6b7280" fontSize="12" textAnchor="middle" x={x} y={plotTop + plotHeight + 17}>
                  {day}日目
                </text>
              </g>
            );
          })}
        </g>
        <line
          stroke="#9ca3af"
          strokeWidth="1"
          x1={plotLeft}
          x2={chartWidth - plotRight}
          y1={plotTop + plotHeight}
          y2={plotTop + plotHeight}
        />
        <line
          stroke="#9ca3af"
          strokeWidth="1"
          x1={plotLeft}
          x2={plotLeft}
          y1={plotTop}
          y2={plotTop + plotHeight}
        />
        <text
          fill="#808080"
          fontSize="12"
          textAnchor="middle"
          transform={`rotate(-90 12 ${plotTop + plotHeight / 2})`}
          x="12"
          y={plotTop + plotHeight / 2}
        >
          ストーリーポイント
        </text>
        <polyline
          fill="none"
          points={toPolylinePoints(idealPoints)}
          stroke="#94a3b8"
          strokeDasharray="4 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <polyline
          fill="none"
          points={toPolylinePoints(actualPoints)}
          stroke="#3b82f6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        {actualPoints.map((point) => (
          <circle cx={point.x} cy={point.y} fill="#3b82f6" key={`${point.x}-${point.y}`} r="4" />
        ))}
        <g transform={`translate(${chartWidth / 2 - 42} ${chartHeight - 15})`}>
          <line stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="2" x1="0" x2="14" y1="0" y2="0" />
          <circle cx="7" cy="0" fill="white" r="2.5" stroke="#94a3b8" strokeWidth="1.5" />
          <text fill="#94a3b8" fontSize="12" x="20" y="4">
            理想線
          </text>
          <line stroke="#3b82f6" strokeWidth="2" x1="65" x2="79" y1="0" y2="0" />
          <circle cx="72" cy="0" fill="#3b82f6" r="2.5" />
          <text fill="#3b82f6" fontSize="12" x="85" y="4">
            実績
          </text>
        </g>
      </svg>
    </div>
  );
}

function BurndownChartEmptyState(): JSX.Element {
  return (
    <div className="min-h-[308px] px-11 pt-6">
      <p className="text-base font-medium leading-6 text-[#898989]">対象データがありません</p>
    </div>
  );
}

function BurndownChartSkeleton(): JSX.Element {
  return (
    <div aria-label="バーンダウンチャートを読み込み中" className="h-[300px] w-full pt-4" role="status">
      <div className="h-[232px] w-full rounded-[10px] border border-dashed border-[#d1d5dc] bg-[#f8fafc]" />
      <div className="mx-auto mt-4 h-4 w-28 rounded-full bg-[#94a3b8]/70" />
    </div>
  );
}

function toChartPoint(day: number, value: number): ChartPoint {
  return {
    x: dayToX(day),
    y: valueToY(value),
  };
}

function dayToX(day: number): number {
  return plotLeft + ((day - 1) / (maxDay - 1)) * plotWidth;
}

function valueToY(value: number): number {
  return plotTop + (1 - value / maxValue) * plotHeight;
}

function toPolylinePoints(points: ChartPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}
