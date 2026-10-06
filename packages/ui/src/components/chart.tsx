"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Area,
  AreaChart as AreaRoot,
  Bar,
  BarChart as BarRoot,
  CartesianGrid,
  Cell,
  Line,
  LineChart as LineRoot,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../lib/cn";

export type ChartConfig = Record<string, { label: string; color?: string }>;

type Row = Record<string, string | number>;
type Format = (value: number) => string;

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const formatValue: Format = (value) => compact.format(value);
const series = (key: string) => `var(--series-${key})`;

const axis = {
  axisLine: false,
  tickLine: false,
  tickMargin: 8,
  tick: { fill: "var(--fg-subtle)", fontSize: 12 },
} as const;

const margin = { top: 8, right: 8, bottom: 0, left: 0 };

function seriesVars(config: ChartConfig) {
  return Object.fromEntries(
    Object.entries(config).map(([key, item], index) => [`--series-${key}`, item.color ?? `var(--chart-${(index % 6) + 1})`]),
  ) as CSSProperties;
}

function Dot({ name }: { name: string }) {
  return <span className="size-2 shrink-0 rounded-full" style={{ background: series(name) }} />;
}

const ChartCursor = createContext<{ x: number; y: number } | null>(null);

function TooltipCard({
  active,
  payload,
  label,
  config,
  format,
}: { active?: boolean; payload?: ReadonlyArray<{ name?: string | number; value?: string | number }>; label?: string | number; config: ChartConfig; format: Format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated/60 border-border grid min-w-36 gap-1.5 rounded-[var(--radius-md)] border px-3 py-2 text-xs shadow-[var(--shadow-md)] backdrop-blur-2xl">
      {label !== undefined && label !== "" ? <p className="text-fg font-medium">{label}</p> : null}
      {payload.map((item) => {
        const name = String(item.name);
        return (
          <div key={name} className="flex items-center gap-2">
            <Dot name={name} />
            <span className="text-fg-muted">{config[name]?.label ?? name}</span>
            <span className="text-fg ml-auto pl-3 font-medium tabular-nums">{format(Number(item.value))}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ChartLegend({ config, className }: { config: ChartConfig; className?: string }) {
  return (
    <div className={cn("text-fg-muted flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs", className)}>
      {Object.entries(config).map(([key, item]) => (
        <span key={key} className="flex items-center gap-1.5">
          <Dot name={key} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function ChartContainer({
  config,
  legend = false,
  className,
  overlay,
  children,
}: {
  config: ChartConfig;
  legend?: boolean;
  className?: string;
  overlay?: ReactNode;
  children: ReactElement;
}) {
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const pending = useRef({ x: 0, y: 0 });

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const plot = event.currentTarget;
    const root = plot.querySelector(".recharts-wrapper") ?? plot;
    const box = root.getBoundingClientRect();
    const tip = plot.querySelector(".recharts-tooltip-wrapper") as HTMLElement | null;
    const tw = Math.max(tip?.offsetWidth ?? 0, 148);
    const th = Math.max(tip?.offsetHeight ?? 0, 52);
    const gap = 12;
    const cx = event.clientX - box.left;
    const cy = event.clientY - box.top;
    let x = cx + gap;
    let y = cy + gap;
    if (x + tw > box.width) x = cx - tw - gap;
    if (y + th > box.height) y = cy - th - gap;
    pending.current = {
      x: Math.min(Math.max(0, x), Math.max(0, box.width - tw)),
      y: Math.min(Math.max(0, y), Math.max(0, box.height - th)),
    };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      setCursor({ ...pending.current });
    });
  };

  return (
    <ChartCursor.Provider value={cursor}>
      <div style={seriesVars(config)} className="grid w-full gap-3">
        <div
          className={cn(
            "hogoshi-chart relative h-64 w-full text-xs select-none outline-none [&_*]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none",
            className,
          )}
          onMouseDown={(event) => event.preventDefault()}
          onPointerEnter={track}
          onPointerMove={track}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
          {overlay}
        </div>
        {legend ? <ChartLegend config={config} /> : null}
      </div>
    </ChartCursor.Provider>
  );
}

export interface CartesianChartProps {
  data: Row[];
  index: string;
  config: ChartConfig;
  stacked?: boolean;
  legend?: boolean;
  grid?: boolean;
  valueFormatter?: Format;
  className?: string;
}

function ChartTooltip({ config, format, cursor }: { config: ChartConfig; format: Format; cursor: object | false }) {
  const pos = useContext(ChartCursor);
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    if (!pos || smooth) return;
    const id = requestAnimationFrame(() => setSmooth(true));
    return () => cancelAnimationFrame(id);
  }, [pos, smooth]);

  return (
    <Tooltip
      cursor={cursor}
      isAnimationActive={false}
      allowEscapeViewBox={{ x: true, y: true }}
      wrapperStyle={
        pos
          ? {
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              transition: smooth ? "transform var(--motion-duration) var(--motion-ease)" : "none",
            }
          : { transition: "none" }
      }
      content={({ active, payload, label }) => (
        <TooltipCard
          active={active}
          payload={payload?.map((item) => ({ name: item.name, value: Array.isArray(item.value) ? item.value[0] : item.value }))}
          label={typeof label === "object" ? undefined : label}
          config={config}
          format={format}
        />
      )}
    />
  );
}

function Axes({ index, format, grid }: { index: string; format: Format; grid: boolean }) {
  return [
    grid ? <CartesianGrid key="grid" vertical={false} stroke="var(--border)" strokeDasharray="3 3" /> : null,
    <XAxis key="x" dataKey={index} minTickGap={24} {...axis} />,
    <YAxis key="y" width={40} tickFormatter={format} {...axis} />,
  ];
}

export function AreaChart({ data, index, config, stacked, legend, grid = true, valueFormatter = formatValue, className }: CartesianChartProps) {
  const id = useId().replaceAll(":", "");
  const keys = Object.keys(config);
  return (
    <ChartContainer config={config} legend={legend} className={className}>
      <AreaRoot data={data} margin={margin}>
        <defs>
          {keys.map((key) => (
            <linearGradient key={key} id={`${id}-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series(key)} stopOpacity={0.32} />
              <stop offset="100%" stopColor={series(key)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {Axes({ index, format: valueFormatter, grid })}
        <ChartTooltip config={config} format={valueFormatter} cursor={{ stroke: "var(--border-strong)" }} />
        {keys.map((key) => (
          <Area
            key={key}
            name={key}
            dataKey={key}
            type="monotone"
            stackId={stacked ? "stack" : undefined}
            stroke={series(key)}
            strokeWidth={2}
            fill={`url(#${id}-${key})`}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaRoot>
    </ChartContainer>
  );
}

export function BarChart({
  data,
  index,
  config,
  stacked,
  legend,
  grid = true,
  valueFormatter = formatValue,
  className,
}: CartesianChartProps) {
  const keys = Object.keys(config);
  return (
    <ChartContainer config={config} legend={legend} className={className}>
      <BarRoot data={data} margin={margin} barGap={4}>
        {Axes({ index, format: valueFormatter, grid })}
        <ChartTooltip config={config} format={valueFormatter} cursor={{ fill: "var(--bg-subtle)" }} />
        {keys.map((key, at) => (
          <Bar
            key={key}
            name={key}
            dataKey={key}
            fill={series(key)}
            maxBarSize={36}
            stackId={stacked ? "stack" : undefined}
            radius={!stacked || at === keys.length - 1 ? [6, 6, 0, 0] : 0}
          />
        ))}
      </BarRoot>
    </ChartContainer>
  );
}

export function LineChart({ data, index, config, legend, grid = true, valueFormatter = formatValue, className }: Omit<CartesianChartProps, "stacked">) {
  const keys = Object.keys(config);
  return (
    <ChartContainer config={config} legend={legend} className={className}>
      <LineRoot data={data} margin={margin}>
        {Axes({ index, format: valueFormatter, grid })}
        <ChartTooltip config={config} format={valueFormatter} cursor={{ stroke: "var(--border-strong)" }} />
        {keys.map((key) => (
          <Line
            key={key}
            name={key}
            dataKey={key}
            type="monotone"
            stroke={series(key)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineRoot>
    </ChartContainer>
  );
}

export function DonutChart({
  data,
  nameKey,
  valueKey,
  config,
  label,
  legend = true,
  valueFormatter = formatValue,
  className,
}: {
  data: Row[];
  nameKey: string;
  valueKey: string;
  config: ChartConfig;
  label?: ReactNode;
  legend?: boolean;
  valueFormatter?: Format;
  className?: string;
}) {
  const total = data.reduce((sum, row) => sum + Number(row[valueKey]), 0);
  return (
    <ChartContainer
      config={config}
      legend={legend}
      className={cn("h-56", className)}
      overlay={
        <div className="hogoshi-chart-label pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-fg text-2xl font-semibold tabular-nums">{valueFormatter(total)}</span>
          {label ? <span className="text-fg-muted text-xs">{label}</span> : null}
        </div>
      }
    >
      <PieChart>
        <ChartTooltip config={config} format={valueFormatter} cursor={false} />
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="70%" outerRadius="100%" paddingAngle={2} cornerRadius={6} stroke="none">
          {data.map((row) => (
            <Cell key={String(row[nameKey])} fill={series(String(row[nameKey]))} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export function Sparkline({
  data,
  dataKey,
  color = "var(--chart-1)",
  className,
}: {
  data: Row[];
  dataKey: string;
  color?: string;
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <div
      className={cn("h-10 w-full select-none outline-none [&_svg]:outline-none", className)}
      onMouseDown={(event) => event.preventDefault()}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaRoot data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey={dataKey} type="monotone" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaRoot>
      </ResponsiveContainer>
    </div>
  );
}
