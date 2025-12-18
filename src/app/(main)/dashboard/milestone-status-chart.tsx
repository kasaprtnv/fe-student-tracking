'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { IMilestoneStats } from '@/types/dashboard';
import { ICourse } from '@/types/course';

interface MilestoneStatusChartProps {
  courseMap: Record<string, ICourse>;
  allCourseIds: string[];
  allYears: string[];
}

const chartConfig = {
  approved: { label: 'ผ่านแล้ว', color: '#22c55e' },
  inProgress: { label: 'กำลังดำเนินการ', color: '#eab308' },
  overdue: { label: 'เลยกำหนด', color: '#ef4444' },
} satisfies ChartConfig;

export function MilestoneStatusChart({
  courseMap,
  allCourseIds,
  allYears,
}: MilestoneStatusChartProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const [selectedYear, setSelectedYear] = React.useState<string>('all');
  const [stats, setStats] = React.useState<IMilestoneStats | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Fetch milestone stats when filters change
  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const courseId = selectedCourse === 'all' ? undefined : selectedCourse;
        const year = selectedYear === 'all' ? undefined : selectedYear;
        const response = await dashboardService.getMilestoneStats(
          courseId,
          year,
        );
        if (response?.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching milestone stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedCourse, selectedYear]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!stats) return [];
    const total = stats.total || 1; // Avoid division by zero
    return [
      {
        name: 'ผ่านแล้ว',
        value: stats.approved,
        percentage: Math.round((stats.approved / total) * 100),
        color: '#22c55e',
      },
      {
        name: 'กำลังดำเนินการ',
        value: stats.inProgress,
        percentage: Math.round((stats.inProgress / total) * 100),
        color: '#eab308',
      },
      {
        name: 'เลยกำหนด',
        value: stats.overdue,
        percentage: Math.round((stats.overdue / total) * 100),
        color: '#ef4444',
      },
    ];
  }, [stats]);

  return (
    <Card className="h-[420px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Milestone</CardTitle>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="หลักสูตร" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {allCourseIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {courseMap[id]?.name || id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="ปีการศึกษา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ปีการศึกษา</SelectItem>
              {allYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : stats && stats.total > 0 ? (
            <>
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-[250px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      outerRadius,
                      percentage,
                      payload,
                    }) => {
                      if (percentage === 0) return null;
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
                          {percentage}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex-1" />
              <div className="flex flex-wrap justify-center gap-4 pb-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.name} {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground flex flex-1 items-center justify-center">
              ไม่มีข้อมูล Milestone
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
