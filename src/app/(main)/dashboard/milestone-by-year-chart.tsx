'use client';

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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MilestoneByYearData {
  year: string;
  passed: number;
  inProgress: number;
  overdue: number;
}

interface MilestoneByYearChartProps {
  data: MilestoneByYearData[];
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  courseOptions: { id: string; name: string }[];
}

const milestoneByYearConfig = {
  passed: { label: 'ผ่านแล้ว', color: '#22c55e' },
  inProgress: { label: 'กำลังดำเนินการ', color: '#3b82f6' },
  overdue: { label: 'เลยกำหนด', color: '#ef4444' },
} satisfies ChartConfig;

export function MilestoneByYearChart({
  data,
  selectedCourse,
  onCourseChange,
  courseOptions,
}: MilestoneByYearChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          Milestone ตามปีการศึกษา
        </CardTitle>
        <Select value={selectedCourse} onValueChange={onCourseChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="เลือกหลักสูตร" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {courseOptions.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={milestoneByYearConfig}
          className="h-[300px] w-full"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="passed"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              name="ผ่านแล้ว"
            />
            <Bar
              dataKey="inProgress"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="กำลังดำเนินการ"
            />
            <Bar
              dataKey="overdue"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="เลยกำหนด"
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-6">
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
      </CardContent>
    </Card>
  );
}
