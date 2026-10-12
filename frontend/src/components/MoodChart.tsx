import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsDay } from "../types";

export function MoodChart({
  data,
  dataKey,
  domain,
  color = "var(--color-teal)",
  formatY,
}: {
  data: AnalyticsDay[];
  dataKey: keyof AnalyticsDay;
  domain?: [number, number];
  color?: string;
  formatY?: (v: number) => string;
}) {
  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(19,28,49,0.45)" }} />
          <YAxis
            hide={false}
            width={28}
            domain={domain || ["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "rgba(19,28,49,0.35)" }}
            tickFormatter={formatY}
          />
          <Tooltip
            formatter={(value) => [typeof value === "number" && formatY ? formatY(value) : String(value ?? ""), ""]}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(19,28,49,0.08)", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color }}
            connectNulls
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
