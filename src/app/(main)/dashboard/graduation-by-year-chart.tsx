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
import { useRouter } from 'next/navigation';
import { CompactMultiCombobox } from '@/components/ui/combobox/compact-multi-combobox';

interface GraduationByYearChartProps {
  students: User[];
  courseMap: Record<string, ICourse>;
  allCourseIds: string[];
  allYears: string[];
}

const chartConfig = {
  graduated: { label: 'จบแล้ว', color: '#22c55e' },
  notGraduated: { label: 'ยังไม่จบ', color: '#eab308' },
} satisfies ChartConfig;

export function GraduationByYearChart({
  students,
  courseMap,
  allCourseIds,
}: GraduationByYearChartProps) {
  const t = useTranslations('dashboard');
  const tFilters = useTranslations('dashboard.filters');
  const tLegend = useTranslations('dashboard.legend');
  const tSummary = useTranslations('dashboard.summary-cards');
  const tDegree = useTranslations('degree');
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [selectedDegree, setSelectedDegree] = React.useState<string>('all');
  const [yearRange, setYearRange] = React.useState<string>('3');

  // Prepare course options for selection
  const courseOptions = React.useMemo(() => {
    return allCourseIds.map((id) => ({
      label: courseMap[id]?.name || id,
      value: id,
    }));
  }, [allCourseIds, courseMap]);

  // Filter students based on selected filters
  const filteredStudents = React.useMemo(() => {
    let filtered = students;

    if (selectedCourses.length > 0) {
      filtered = filtered.filter((s) =>
        selectedCourses.includes(s.courseId || ''),
      );
    }

    if (selectedDegree !== 'all') {
      filtered = filtered.filter((s) => s.degree === selectedDegree);
    }

    return filtered;
  }, [students, selectedCourses, selectedDegree]);

  // Group filtered students by year
  const rawData = React.useMemo(() => {
    const yearMap: Record<string, { graduated: number; notGraduated: number }> =
      {};

    for (const student of filteredStudents) {
      const year = student.year?.trim();
      if (!year) {
        continue;
      }
      if (!yearMap[year]) {
        yearMap[year] = { graduated: 0, notGraduated: 0 };
      }

      if (student.graduated) {
        yearMap[year].graduated++;
      } else {
        yearMap[year].notGraduated++;
      }
    }

    // Convert to sorted array
    return Object.entries(yearMap)
      .map(([year, stats]) => ({
        year,
        graduated: stats.graduated,
        notGraduated: stats.notGraduated,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredStudents]);

  // Filter data by year range
  const data = React.useMemo(() => {
    if (yearRange === 'all') return rawData;
    const currentYear = new Date().getFullYear() + 543; // พ.ศ.
    const yearsToShow = parseInt(yearRange);
    return rawData.filter((item) => {
      const year = parseInt(item.year);
      if (isNaN(year)) return false;
      return year >= currentYear - yearsToShow + 1;
    });
  }, [rawData, yearRange]);

  return (
    <Card className="min-h-[420px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="min-w-0 truncate text-lg font-bold">
            {t('charts.graduation-by-year')}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-2">
            <CompactMultiCombobox
              value={selectedCourses}
              onChange={setSelectedCourses}
              options={courseOptions}
              placeholder={tFilters('all-courses')}
              placeholderSearch={tFilters('course')}
              placeholderEmpty={t('charts.no-data')}
              displayString={tFilters('course')}
            />
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
        <div className="flex h-[320px] flex-col">
          {data.length > 0 ? (
            <>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart
                  data={data}
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
                        const data = payload[0].payload;
                        const total = data.graduated + data.notGraduated;
                        return (
                          <div className="rounded-lg border bg-white p-2 shadow-sm">
                            <div className="mb-1 font-medium">{label}</div>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                              <span>
                                {tLegend('graduated')}: {data.graduated}{' '}
                                {tSummary('unit-people')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-[#eab308]" />
                              <span>
                                {tLegend('not-graduated')}: {data.notGraduated}{' '}
                                {tSummary('unit-people')}
                              </span>
                            </div>
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
                  <Bar
                    dataKey="graduated"
                    name={tLegend('graduated')}
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => {
                      if (data?.year) {
                        const params = new URLSearchParams();
                        params.set('year', String(data.year));
                        params.set('graduated', 'true');
                        if (selectedDegree !== 'all') {
                          params.set('degree', selectedDegree);
                        }
                        if (selectedCourses.length > 0) {
                          params.set('courseId', selectedCourses.join(','));
                        }
                        router.push(`/students?${params.toString()}`);
                      }
                    }}
                  >
                    <LabelList
                      dataKey="graduated"
                      position="top"
                      fontSize={12}
                      fill="#000000"
                      formatter={(value: number) => (value === 0 ? '' : value)}
                    />
                  </Bar>
                  <Bar
                    dataKey="notGraduated"
                    name={tLegend('not-graduated')}
                    fill="#eab308"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => {
                      if (data?.year) {
                        const params = new URLSearchParams();
                        params.set('year', String(data.year));
                        params.set('graduated', 'false');
                        if (selectedDegree !== 'all') {
                          params.set('degree', selectedDegree);
                        }
                        if (selectedCourses.length > 0) {
                          params.set('courseId', selectedCourses.join(','));
                        }
                        router.push(`/students?${params.toString()}`);
                      }
                    }}
                  >
                    <LabelList
                      dataKey="notGraduated"
                      position="top"
                      fontSize={12}
                      fill="#000000"
                      formatter={(value: number) => (value === 0 ? '' : value)}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="flex-1" />
              <div className="flex flex-wrap justify-center gap-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  <span className="text-sm">{tLegend('graduated')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#eab308]" />
                  <span className="text-sm">{tLegend('not-graduated')}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground flex flex-1 items-center justify-center">
              {t('charts.no-data')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
