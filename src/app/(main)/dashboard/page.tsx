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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
} from 'recharts';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

// Mock data for donut chart
const milestoneDonutData = [
  { name: 'ผ่านแล้ว', value: 40, color: '#22c55e' },
  { name: 'กำลังดำเนินการ', value: 35, color: '#eab308' },
  { name: 'เลยกำหนด', value: 25, color: '#ef4444' },
];

// Mock data for bar chart
const milestoneBarData = [
  { year: '2565', passed: 65, inProgress: 50, overdue: 5 },
  { year: '2566', passed: 70, inProgress: 45, overdue: 8 },
  { year: '2567', passed: 55, inProgress: 40, overdue: 10 },
  { year: '2568', passed: 80, inProgress: 60, overdue: 5 },
  { year: '2569', passed: 90, inProgress: 15, overdue: 3 },
];

// Mock data for degree programs
const degreePrograms = {
  master: {
    title: 'ปริญญาโท',
    programs: [
      {
        name: 'หลักสูตร A',
        majors: ['สาขา A', 'สาขา B'],
      },
      {
        name: 'หลักสูตร B',
        majors: ['สาขา A', 'สาขา B'],
      },
      {
        name: 'หลักสูตร C',
        majors: ['สาขา A', 'สาขา B', 'สาขา C'],
      },
      {
        name: 'หลักสูตร D',
        majors: ['สาขา A'],
      },
    ],
  },
  doctoral: {
    title: 'ปริญญาเอก',
    programs: [
      {
        name: 'หลักสูตร A',
        majors: ['สาขา A', 'สาขา B'],
      },
      {
        name: 'หลักสูตร B',
        majors: ['สาขา A', 'สาขา B'],
      },
      {
        name: 'หลักสูตร C',
        majors: ['สาขา A'],
      },
    ],
  },
};

const donutChartConfig = {
  passed: {
    label: 'ผ่านแล้ว',
    color: '#22c55e',
  },
  inProgress: {
    label: 'กำลังดำเนินการ',
    color: '#eab308',
  },
  overdue: {
    label: 'เลยกำหนด',
    color: '#ef4444',
  },
} satisfies ChartConfig;

const barChartConfig = {
  passed: {
    label: 'ผ่านแล้ว',
    color: '#22c55e',
  },
  inProgress: {
    label: 'กำลังดำเนินการ',
    color: '#eab308',
  },
  overdue: {
    label: 'เลยกำหนด',
    color: '#ef4444',
  },
} satisfies ChartConfig;

const DashboardPage = () => {
  // States for Donut Chart
  const [donutStatus, setDonutStatus] = React.useState('all');
  const [donutYear, setDonutYear] = React.useState('all');

  // States for Bar Chart
  const [barStatus, setBarStatus] = React.useState('all');
  const [barYear, setBarYear] = React.useState('all');

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut Chart Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Milestone</CardTitle>
            <div className="flex gap-2">
              <Select value={donutStatus} onValueChange={setDonutStatus}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="passed">ผ่านแล้ว</SelectItem>
                  <SelectItem value="inProgress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="overdue">เลยกำหนด</SelectItem>
                </SelectContent>
              </Select>
              <Select value={donutYear} onValueChange={setDonutYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="ปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ปีการศึกษา</SelectItem>
                  <SelectItem value="2565">2565</SelectItem>
                  <SelectItem value="2566">2566</SelectItem>
                  <SelectItem value="2567">2567</SelectItem>
                  <SelectItem value="2568">2568</SelectItem>
                  <SelectItem value="2569">2569</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={donutChartConfig}
              className="mx-auto aspect-square h-[300px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={milestoneDonutData}
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
                  {milestoneDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6">
              {milestoneDonutData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">
                    {item.name}{' '}
                    <span className="text-muted-foreground">{item.value}%</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Milestone</CardTitle>
            <div className="flex gap-2">
              <Select value={barStatus} onValueChange={setBarStatus}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="passed">ผ่านแล้ว</SelectItem>
                  <SelectItem value="inProgress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="overdue">เลยกำหนด</SelectItem>
                </SelectContent>
              </Select>
              <Select value={barYear} onValueChange={setBarYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="ปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ปีการศึกษา</SelectItem>
                  <SelectItem value="2565">2565</SelectItem>
                  <SelectItem value="2566">2566</SelectItem>
                  <SelectItem value="2567">2567</SelectItem>
                  <SelectItem value="2568">2568</SelectItem>
                  <SelectItem value="2569">2569</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={milestoneBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="passed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="inProgress"
                  fill="#eab308"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">ผ่านแล้ว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
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

      {/* Degree Programs Section */}
      <div className="space-y-4">
        {/* Master's Degree */}
        <div className="space-y-2">
          <Card className="border">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="master" className="border-none">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6" />
                    <span className="text-xl font-bold">
                      {degreePrograms.master.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Accordion type="single" collapsible className="w-full">
                    {degreePrograms.master.programs.map((program, idx) => (
                      <div key={idx} className="mb-2 space-y-2">
                        <Card className="border">
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem
                              value={`master-program-${idx}`}
                              className="border-none"
                            >
                              <AccordionTrigger className="flex-row-reverse justify-end gap-2 px-4 py-3 hover:no-underline [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0">
                                <span>{program.name}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3">
                                <div className="space-y-2">
                                  {program.majors.map((major, mIdx) => (
                                    <Link
                                      key={mIdx}
                                      href="/student"
                                      className="hover:bg-accent ml-6 block rounded-md border px-4 py-2 transition-colors"
                                    >
                                      <span>{major}</span>
                                    </Link>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </Card>
                      </div>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* Doctoral Degree */}
        <div className="space-y-2">
          <Card className="border">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="doctoral" className="border-none">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6" />
                    <span className="text-xl font-bold">
                      {degreePrograms.doctoral.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Accordion type="single" collapsible className="w-full">
                    {degreePrograms.doctoral.programs.map((program, idx) => (
                      <div key={idx} className="mb-2 space-y-2">
                        <Card className="border">
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem
                              value={`doctoral-program-${idx}`}
                              className="border-none"
                            >
                              <AccordionTrigger className="flex-row-reverse justify-end gap-2 px-4 py-3 hover:no-underline [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0">
                                <span>{program.name}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3">
                                <div className="space-y-2">
                                  {program.majors.map((major, mIdx) => (
                                    <Link
                                      key={mIdx}
                                      href="/student"
                                      className="hover:bg-accent ml-6 block rounded-md border px-4 py-2 transition-colors"
                                    >
                                      <span>{major}</span>
                                    </Link>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </Card>
                      </div>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
