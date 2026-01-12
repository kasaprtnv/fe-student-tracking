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
import { User } from '@/types/user';
import { ICourse } from '@/types/course';
import { useTranslations } from 'next-intl';
import { CompactMultiCombobox } from '@/components/ui/combobox/compact-multi-combobox';

interface StudentsByYearCourseChartProps {
  students: User[];
  courseMap: Record<string, ICourse>;
}

export function StudentsByYearCourseChart({
  students,
  courseMap,
}: StudentsByYearCourseChartProps) {
  const t = useTranslations('dashboard');
  const tFilters = useTranslations('dashboard.filters');
  const tDegree = useTranslations('degree');
  const tLegend = useTranslations('dashboard.legend');
  const tSummary = useTranslations('dashboard.summary-cards');
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [yearRange, setYearRange] = React.useState<string>('3');
  const [selectedDegree, setSelectedDegree] = React.useState<string>('all');

  // Compute chart data from students
  const { chartData, courseColors, courseNames, allYears } =
    React.useMemo(() => {
      // Filter students by degree first
      let filteredStudents = students;
      if (selectedDegree !== 'all') {
        filteredStudents = students.filter((s) => s.degree === selectedDegree);
      }

      // Get unique years and courses
      const yearSet = new Set<string>();
      const courseSet = new Set<string>();

      filteredStudents.forEach((student) => {
        if (student.year) yearSet.add(student.year);
        if (student.courseId) courseSet.add(student.courseId);
      });

      const years = Array.from(yearSet).sort();
      const courseIds = Array.from(courseSet);

      // Create color palette for courses
      const colors = ['#93c5fd', '#fef08a', '#fca5a5', '#86efac', '#c4b5fd'];
      const colorMap: Record<string, string> = {};
      const nameMap: Record<string, string> = {};

      courseIds.forEach((id, index) => {
        colorMap[id] = colors[index % colors.length];
        const course = courseMap[id];
        nameMap[id] = course?.name || `หลักสูตร ${index + 1}`;
      });

      // Build data for each year
      const data = years.map((year) => {
        const yearData: Record<string, number | string> = { year };

        courseIds.forEach((courseId) => {
          const count = filteredStudents.filter(
            (s) => s.year === year && s.courseId === courseId,
          ).length;
          yearData[courseId] = count;
        });

        return yearData;
      });

      return {
        chartData: data,
        courseColors: colorMap,
        courseNames: nameMap,
        allYears: years,
      };
    }, [students, courseMap, selectedDegree]);

  // Prepare course options for selection
  const courseOptions = React.useMemo(() => {
    return Object.entries(courseNames).map(([id, name]) => ({
      label: name,
      value: id,
    }));
  }, [courseNames]);

  // Filter data based on year range and course selection
  const filteredData = React.useMemo(() => {
    let filtered = [...chartData];

    // Filter by year range
    if (yearRange !== 'all' && allYears.length > 0) {
      const numYears = parseInt(yearRange, 10);
      const sortedYears = [...allYears].sort().reverse();
      const recentYears = sortedYears.slice(0, numYears);
      filtered = filtered.filter((item) =>
        recentYears.includes(item.year as string),
      );
    }

    // Sort by year
    filtered.sort((a, b) => String(a.year).localeCompare(String(b.year)));

    return filtered;
  }, [chartData, yearRange, allYears]);

  // Filter course colors/names if specific courses are selected
  const displayCourseColors = React.useMemo(() => {
    if (selectedCourses.length === 0) return courseColors;
    return Object.fromEntries(
      Object.entries(courseColors).filter(([id]) =>
        selectedCourses.includes(id),
      ),
    );
  }, [selectedCourses, courseColors]);

  const displayCourseNames = React.useMemo(() => {
    if (selectedCourses.length === 0) return courseNames;
    return Object.fromEntries(
      Object.entries(courseNames).filter(([id]) =>
        selectedCourses.includes(id),
      ),
    );
  }, [selectedCourses, courseNames]);

  return (
    <Card className="min-h-[420px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-bold">
            {t('charts.students-by-course')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedDegree} onValueChange={setSelectedDegree}>
              <SelectTrigger className="w-auto min-w-[100px]">
                <SelectValue placeholder={tFilters('degree')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tFilters('all-degrees')}</SelectItem>
                <SelectItem value="master">{tDegree('master')}</SelectItem>
                <SelectItem value="doctorate">
                  {tDegree('doctorate')}
                </SelectItem>
              </SelectContent>
            </Select>
            <CompactMultiCombobox
              value={selectedCourses}
              onChange={setSelectedCourses}
              options={courseOptions}
              placeholder={tFilters('all-courses')}
              placeholderSearch={tFilters('course')}
              placeholderEmpty={t('charts.no-data')}
            />
            <Select value={yearRange} onValueChange={setYearRange}>
              <SelectTrigger className="w-auto min-w-[80px]">
                <SelectValue placeholder="ช่วงปี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">{tFilters('years-3')}</SelectItem>
                <SelectItem value="5">{tFilters('years-5')}</SelectItem>
                <SelectItem value="10">{tFilters('years-10')}</SelectItem>
                <SelectItem value="all">{tFilters('all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] flex-col">
          {filteredData.length > 0 ? (
            <>
              <ChartContainer
                config={{} as ChartConfig}
                className="h-[220px] w-full"
              >
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const total = payload.reduce(
                          (sum, item) => sum + (Number(item.value) || 0),
                          0,
                        );
                        return (
                          <div className="rounded-lg border bg-white p-2 shadow-sm">
                            <div className="mb-1 font-medium">{label}</div>
                            {payload.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
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
                  {Object.keys(displayCourseColors).map((courseId) => (
                    <Bar
                      key={courseId}
                      dataKey={courseId}
                      name={displayCourseNames[courseId]}
                      fill={displayCourseColors[courseId]}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey={courseId}
                        position="top"
                        fontSize={12}
                        fill="#333"
                        formatter={(value: number) =>
                          value === 0 ? '' : value
                        }
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ChartContainer>
              <div className="flex-1" />
              <div className="flex flex-wrap justify-center gap-4 pb-4">
                {Object.entries(displayCourseNames).map(([id, name]) => (
                  <div key={id} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: displayCourseColors[id] }}
                    />
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground flex flex-1 items-center justify-center">
              ไม่มีข้อมูลนักศึกษา
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
