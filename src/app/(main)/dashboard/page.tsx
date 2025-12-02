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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  BookOpen,
  Target,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

// Mock data for milestone status donut chart
const milestoneStatusData = [
  { name: 'ผ่านแล้ว', value: 45, color: '#22c55e' },
  { name: 'กำลังดำเนินการ', value: 35, color: '#3b82f6' },
  { name: 'เลยกำหนด', value: 20, color: '#ef4444' },
];

// Mock data for students by course bar chart
const studentsByCourseData = [
  { course: 'วิศวกรรมซอฟต์แวร์', master: 45, doctoral: 12 },
  { course: 'วิทยาการคอมพิวเตอร์', master: 38, doctoral: 8 },
  { course: 'เทคโนโลยีสารสนเทศ', master: 52, doctoral: 15 },
  { course: 'วิศวกรรมข้อมูล', master: 30, doctoral: 6 },
  { course: 'ปัญญาประดิษฐ์', master: 25, doctoral: 10 },
];

// Mock data for milestone by year bar chart
const milestoneByYearData = [
  { year: '2565', passed: 65, inProgress: 25, overdue: 10 },
  { year: '2566', passed: 70, inProgress: 20, overdue: 10 },
  { year: '2567', passed: 55, inProgress: 35, overdue: 10 },
  { year: '2568', passed: 80, inProgress: 15, overdue: 5 },
];

// Mock data for students by degree pie chart
const studentsByDegreeData = [
  { name: 'ปริญญาโท', value: 190, color: '#8b5cf6' },
  { name: 'ปริญญาเอก', value: 51, color: '#f59e0b' },
];

// Mock data for student enrollment trend area chart
const enrollmentTrendData = [
  { month: 'ม.ค.', newStudents: 15, graduated: 5 },
  { month: 'ก.พ.', newStudents: 12, graduated: 8 },
  { month: 'มี.ค.', newStudents: 18, graduated: 10 },
  { month: 'เม.ย.', newStudents: 8, graduated: 12 },
  { month: 'พ.ค.', newStudents: 22, graduated: 15 },
  { month: 'มิ.ย.', newStudents: 25, graduated: 8 },
  { month: 'ก.ค.', newStudents: 30, graduated: 6 },
  { month: 'ส.ค.', newStudents: 28, graduated: 10 },
  { month: 'ก.ย.', newStudents: 20, graduated: 12 },
  { month: 'ต.ค.', newStudents: 16, graduated: 18 },
  { month: 'พ.ย.', newStudents: 14, graduated: 20 },
  { month: 'ธ.ค.', newStudents: 10, graduated: 15 },
];

// Chart configs
const milestoneStatusConfig = {
  passed: { label: 'ผ่านแล้ว', color: '#22c55e' },
  inProgress: { label: 'กำลังดำเนินการ', color: '#3b82f6' },
  overdue: { label: 'เลยกำหนด', color: '#ef4444' },
} satisfies ChartConfig;

const studentsByCourseConfig = {
  master: { label: 'ปริญญาโท', color: '#8b5cf6' },
  doctoral: { label: 'ปริญญาเอก', color: '#f59e0b' },
} satisfies ChartConfig;

const milestoneByYearConfig = {
  passed: { label: 'ผ่านแล้ว', color: '#22c55e' },
  inProgress: { label: 'กำลังดำเนินการ', color: '#3b82f6' },
  overdue: { label: 'เลยกำหนด', color: '#ef4444' },
} satisfies ChartConfig;

const studentsByDegreeConfig = {
  master: { label: 'ปริญญาโท', color: '#8b5cf6' },
  doctoral: { label: 'ปริญญาเอก', color: '#f59e0b' },
} satisfies ChartConfig;

const enrollmentTrendConfig = {
  newStudents: { label: 'นักศึกษาใหม่', color: '#3b82f6' },
  graduated: { label: 'สำเร็จการศึกษา', color: '#22c55e' },
} satisfies ChartConfig;

const DashboardPage = () => {
  const [selectedYear, setSelectedYear] = React.useState('all');
  const [selectedCourse, setSelectedCourse] = React.useState('all');

  // Calculate totals for summary cards
  const totalStudents = studentsByDegreeData.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const totalCourses = studentsByCourseData.length;
  const totalMilestones = milestoneStatusData.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const completionRate = Math.round(
    (milestoneStatusData[0].value / totalMilestones) * 100,
  );

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              นักศึกษาทั้งหมด
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-muted-foreground text-xs">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              หลักสูตรทั้งหมด
            </CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-muted-foreground text-xs">หลักสูตร</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Milestone ทั้งหมด
            </CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMilestones}</div>
            <p className="text-muted-foreground text-xs">รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              อัตราสำเร็จ Milestone
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-muted-foreground text-xs">ผ่านแล้ว</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Milestone Status Donut Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">สถานะ Milestone</CardTitle>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="ปีการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="2565">2565</SelectItem>
                <SelectItem value="2566">2566</SelectItem>
                <SelectItem value="2567">2567</SelectItem>
                <SelectItem value="2568">2568</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={milestoneStatusConfig}
              className="mx-auto aspect-square h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={milestoneStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {milestoneStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-4">
              {milestoneStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Students by Degree Pie Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">
              นักศึกษาตามระดับปริญญา
            </CardTitle>
            <GraduationCap className="text-muted-foreground h-5 w-5" />
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={studentsByDegreeConfig}
              className="mx-auto aspect-square h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={studentsByDegreeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${value} คน`}
                  labelLine={false}
                >
                  {studentsByDegreeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-6">
              {studentsByDegreeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">
                    {item.name}{' '}
                    <span className="text-muted-foreground">
                      {item.value} คน
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 3: Students by Course Bar Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">
              จำนวนนักศึกษาตามหลักสูตร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={studentsByCourseConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={studentsByCourseData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="course"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="master"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  name="ปริญญาโท"
                />
                <Bar
                  dataKey="doctoral"
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                  name="ปริญญาเอก"
                />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-500" />
                <span className="text-sm">ปริญญาโท</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm">ปริญญาเอก</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Milestone by Year Bar Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">
              Milestone ตามปีการศึกษา
            </CardTitle>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="หลักสูตร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหลักสูตร</SelectItem>
                <SelectItem value="se">วิศวกรรมซอฟต์แวร์</SelectItem>
                <SelectItem value="cs">วิทยาการคอมพิวเตอร์</SelectItem>
                <SelectItem value="it">เทคโนโลยีสารสนเทศ</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={milestoneByYearConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={milestoneByYearData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="passed"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  name="ผ่านแล้ว"
                  stackId="a"
                />
                <Bar
                  dataKey="inProgress"
                  fill="#3b82f6"
                  radius={[0, 0, 0, 0]}
                  name="กำลังดำเนินการ"
                  stackId="a"
                />
                <Bar
                  dataKey="overdue"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="เลยกำหนด"
                  stackId="a"
                />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">ผ่านแล้ว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">กำลังดำเนินการ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">เลยกำหนด</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
