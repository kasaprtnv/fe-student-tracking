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
import { Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { ICourse } from '@/types/course';
import { useTranslations } from 'next-intl';

interface GraduationByYearChartProps {
  courseMap: Record<string, ICourse>;
  allCourseIds: string[];
}

const chartConfig = {
  graduated: { label: 'จบแล้ว', color: '#22c55e' },
  notGraduated: { label: 'ยังไม่จบ', color: '#eab308' },
} satisfies ChartConfig;

export function GraduationByYearChart({
  courseMap,
  allCourseIds,
}: GraduationByYearChartProps) {
  const t = useTranslations('dashboard');
  const tFilters = useTranslations('dashboard.filters');
  const tLegend = useTranslations('dashboard.legend');
  const tSummary = useTranslations('dashboard.summary-cards');
  const tDegree = useTranslations('degree');
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const [selectedDegree, setSelectedDegree] = React.useState<string>('all');
  const [yearRange, setYearRange] = React.useState<string>('3');
  const [rawData, setRawData] = React.useState<
    { year: string; graduated: number; notGraduated: number }[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch graduation stats when filter changes
  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const courseId = selectedCourse === 'all' ? undefined : selectedCourse;
        const degree = selectedDegree === 'all' ? undefined : selectedDegree;
        const response = await dashboardService.getGraduationStatsByYear(
          courseId,
          degree,
        );
        if (response?.data) {
          setRawData(response.data);
        }
      } catch (error) {
        console.error('Error fetching graduation stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedCourse, selectedDegree]);

  // Filter data by year range
  const data = React.useMemo(() => {
    if (yearRange === 'all') return rawData;
    const currentYear = new Date().getFullYear() + 543; // พ.ศ.
    const yearsToShow = parseInt(yearRange);
    return rawData.filter((item) => {
      const year = parseInt(item.year);
      return year >= currentYear - yearsToShow + 1;
    });
  }, [rawData, yearRange]);

  return (
    <Card className="h-[420px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          {t('charts.graduation-by-year')}
        </CardTitle>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[120px]">
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
          <Select value={selectedDegree} onValueChange={setSelectedDegree}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={tFilters('degree')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tFilters('all-degrees')}</SelectItem>
              <SelectItem value="bachelor">{tDegree('bachelor')}</SelectItem>
              <SelectItem value="master">{tDegree('master')}</SelectItem>
              <SelectItem value="doctorate">{tDegree('doctorate')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearRange} onValueChange={setYearRange}>
            <SelectTrigger className="w-[130px]">
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
