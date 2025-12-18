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
import { User } from '@/types/user';
import { ICourse } from '@/types/course';

interface StudentsByYearCourseChartProps {
  students: User[];
  courseMap: Record<string, ICourse>;
}

export function StudentsByYearCourseChart({
  students,
  courseMap,
}: StudentsByYearCourseChartProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const [yearRange, setYearRange] = React.useState<string>('5');
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

  // Filter course colors/names if specific course is selected
  const displayCourseColors = React.useMemo(() => {
    if (selectedCourse === 'all') return courseColors;
    if (courseColors[selectedCourse]) {
      return { [selectedCourse]: courseColors[selectedCourse] };
    }
    return courseColors;
  }, [selectedCourse, courseColors]);

  const displayCourseNames = React.useMemo(() => {
    if (selectedCourse === 'all') return courseNames;
    if (courseNames[selectedCourse]) {
      return { [selectedCourse]: courseNames[selectedCourse] };
    }
    return courseNames;
  }, [selectedCourse, courseNames]);

  return (
    <Card className="h-[420px]">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-bold">
            จำนวนนักศึกษาในแต่ละหลักสูตร
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedDegree} onValueChange={setSelectedDegree}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="ระดับ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับ</SelectItem>
                <SelectItem value="bachelor">ปริญญาตรี</SelectItem>
                <SelectItem value="master">ปริญญาโท</SelectItem>
                <SelectItem value="doctorate">ปริญญาเอก</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="หลักสูตร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหลักสูตร</SelectItem>
                {Object.entries(courseNames).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearRange} onValueChange={setYearRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="ช่วงปี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ปีล่าสุด</SelectItem>
                <SelectItem value="5">5 ปีล่าสุด</SelectItem>
                <SelectItem value="10">10 ปีล่าสุด</SelectItem>
                <SelectItem value="all">ทั้งหมด</SelectItem>
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
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
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
