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
import { User } from '@/types/user';
import { ICourse } from '@/types/course';
import { useTranslations } from 'next-intl';

interface StudentsByDegreeChartProps {
  students: User[];
  courseMap: Record<string, ICourse>;
  allCourseIds: string[];
  allYears: string[];
}

const studentsByDegreeConfig = {
  master: { label: 'ปริญญาโท', color: '#8b5cf6' },
  doctoral: { label: 'ปริญญาเอก', color: '#f59e0b' },
} satisfies ChartConfig;

export function StudentsByDegreeChart({
  students,
  courseMap,
  allCourseIds,
  allYears,
}: StudentsByDegreeChartProps) {
  const t = useTranslations('dashboard');
  const tLegend = useTranslations('dashboard.legend');
  const tFilters = useTranslations('dashboard.filters');
  const tSummary = useTranslations('dashboard.summary-cards');
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const [selectedYear, setSelectedYear] = React.useState<string>('all');

  // Filter students based on selected filters
  const filteredStudents = React.useMemo(() => {
    let filtered = students;

    if (selectedCourse !== 'all') {
      filtered = filtered.filter((s) => s.courseId === selectedCourse);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter((s) => s.year === selectedYear);
    }

    return filtered;
  }, [students, selectedCourse, selectedYear]);

  // Calculate degree counts from filtered students
  const data = React.useMemo(() => {
    const masterCount = filteredStudents.filter(
      (user) => user.degree === 'master',
    ).length;
    const doctorateCount = filteredStudents.filter(
      (user) => user.degree === 'doctorate',
    ).length;
    return [
      { name: tLegend('master'), value: masterCount, color: '#8b5cf6' },
      { name: tLegend('doctorate'), value: doctorateCount, color: '#f59e0b' },
    ];
  }, [filteredStudents, tLegend]);

  return (
    <Card className="h-[420px]">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-bold">
            {t('charts.students-by-degree')}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="หลักสูตร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tFilters('all-courses')}</SelectItem>
                {allCourseIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {courseMap[id]?.name || id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="ปีการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tFilters('all-years')}</SelectItem>
                {allYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] flex-col">
          {data[0].value + data[1].value > 0 ? (
            <>
              <ChartContainer
                config={studentsByDegreeConfig}
                className="mx-auto h-[220px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = data[0].value + data[1].value;
                        return (
                          <div className="rounded-lg border bg-white p-2 shadow-sm">
                            {payload.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{
                                    backgroundColor: item.payload.color,
                                  }}
                                />
                                <span>
                                  {item.name}: {item.value}{' '}
                                  {tSummary('unit-people')}
                                </span>
                              </div>
                            ))}
                            <div className="mt-1 border-t pt-1 font-medium">
                              {tLegend('total')}: {total}{' '}
                              {tSummary('unit-people')}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data}
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
                      value,
                      payload,
                    }) => {
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
                      <span className="text-muted-foreground">
                        {item.value} {tSummary('unit-people')}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">{t('charts.no-data')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
