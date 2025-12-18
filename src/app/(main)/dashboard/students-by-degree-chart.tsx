'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

interface StudentsByDegreeData {
  name: string;
  value: number;
  color: string;
}

interface StudentsByDegreeChartProps {
  data: StudentsByDegreeData[];
}

const studentsByDegreeConfig = {
  master: { label: 'ปริญญาโท', color: '#8b5cf6' },
  doctoral: { label: 'ปริญญาเอก', color: '#f59e0b' },
} satisfies ChartConfig;

export function StudentsByDegreeChart({ data }: StudentsByDegreeChartProps) {
  return (
    <Card className="h-[420px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          นักศึกษาตามระดับปริญญา
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[340px] flex-col">
          <ChartContainer
            config={studentsByDegreeConfig}
            className="mx-auto h-[250px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ cx, cy, midAngle, outerRadius, value, payload }) => {
                  if (value === 0) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 15;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={payload.color}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex-1" />
          <div className="flex justify-center gap-6 pb-4">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {item.name}{' '}
                  <span className="text-muted-foreground">{item.value} คน</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
