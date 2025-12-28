'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface TierDistributionChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = {
  Free: 'hsl(var(--muted))',
  Pro: 'hsl(var(--primary))',
  Whale: 'hsl(var(--secondary))',
  Admin: 'hsl(var(--destructive))',
}

export function TierDistributionChart({ data }: TierDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Free}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '2px solid hsl(var(--border))',
            borderRadius: '0',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
