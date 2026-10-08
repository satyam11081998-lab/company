'use client';

/** Small chart wrapper (recharts) using the site's validated data-viz palette. */
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bars } from '../ui';

export const VIZ = ['hsl(var(--viz-1))', 'hsl(var(--viz-2))', 'hsl(var(--viz-3))', 'hsl(var(--viz-4))', 'hsl(var(--viz-5))'];
const compact = (n: number) => (Math.abs(n) >= 1e7 ? `${(n / 1e7).toFixed(1)}Cr` : Math.abs(n) >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(Math.round(n * 100) / 100));

export function Chart({ kind, data, height = 240, format = (n: number) => n.toLocaleString('en-IN') }: {
  kind: 'bar' | 'line' | 'pie' | 'funnel' | 'none';
  data: Array<{ label: string; value: number }>;
  height?: number;
  format?: (n: number) => string;
}) {
  if (!data.length || kind === 'none') return null;
  if (kind === 'funnel') return <Bars data={data} format={format} />;
  const tip = { contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }, formatter: (v: number) => format(Number(v)) };
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'pie' ? (
          <PieChart>
            <Pie data={data.slice(0, 10)} dataKey="value" nameKey="label" outerRadius="80%" label={(e: { label: string }) => e.label} labelLine={false} isAnimationActive={false}>
              {data.slice(0, 10).map((_, i) => <Cell key={i} fill={VIZ[i % VIZ.length]} />)}
            </Pie>
            <Tooltip {...tip} />
          </PieChart>
        ) : kind === 'line' ? (
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} width={48} />
            <Tooltip {...tip} />
            <Line dataKey="value" stroke={VIZ[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} width={48} />
            <Tooltip {...tip} />
            <Bar dataKey="value" fill={VIZ[0]} maxBarSize={56} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
