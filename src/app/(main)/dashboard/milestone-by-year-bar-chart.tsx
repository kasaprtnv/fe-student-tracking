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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { IMilestoneStatsByYearItem } from '@/types/dashboard';
import { ICourse } from '@/types/course';

interface MilestoneByYearBarChartProps {
  courseMap: Record<string, ICourse>;
  allCourseIds: string[];
}

const chartConfig = {
  approved: { label: 'ผ่านแล้ว', color: '#22c55e' },
  inProgress: { label: 'กำลังดำเนินการ', color: '#3b82f6' },
  overdue: { label: 'เลยกำหนด', color: '#ef4444' },
} satisfies ChartConfig;

export function MilestoneByYearBarChart({
  courseMap,
  allCourseIds,
}: MilestoneByYearBarChartProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const [data, setData] = React.useState<IMilestoneStatsByYearItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch milestone stats by year when course filter changes
  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const courseId = selectedCourse === 'all' ? undefined : selectedCourse;
        const response =
          await dashboardService.getMilestoneStatsByYear(courseId);
        if (response?.data?.data) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching milestone stats by year:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedCourse]);

  return (
    <Card className="h-[420px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          Milestone ตามปีการศึกษา
        </CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[320px] flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : data.length > 0 ? (
            <>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="approved"
                    name="ผ่านแล้ว"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="approved"
                      position="top"
                      fontSize={12}
                      fill="#22c55e"
                      formatter={(value: number) => (value === 0 ? '' : value)}
                    />
                  </Bar>
                  <Bar
                    dataKey="inProgress"
                    name="กำลังดำเนินการ"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="inProgress"
                      position="top"
                      fontSize={12}
                      fill="#3b82f6"
                      formatter={(value: number) => (value === 0 ? '' : value)}
                    />
                  </Bar>
                  <Bar
                    dataKey="overdue"
                    name="เลยกำหนด"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="overdue"
                      position="top"
                      fontSize={12}
                      fill="#ef4444"
                      formatter={(value: number) => (value === 0 ? '' : value)}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="flex-1" />
              <div className="flex flex-wrap justify-center gap-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  <span className="text-sm">ผ่านแล้ว</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-sm">กำลังดำเนินการ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="text-sm">เลยกำหนด</span>
                </div>
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
