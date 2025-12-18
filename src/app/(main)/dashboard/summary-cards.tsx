'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Target, GraduationCap, Loader2 } from 'lucide-react';

interface SummaryCardsProps {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalMilestones: number;
  isLoading: boolean;
}

export function SummaryCards({
  totalStudents,
  totalTeachers,
  totalCourses,
  totalMilestones,
  isLoading,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-muted-foreground text-xs">คน</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            ผู้รับผิดชอบหลักสูตร
          </CardTitle>
          <GraduationCap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalTeachers}</div>
              <p className="text-muted-foreground text-xs">คน</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">หลักสูตรทั้งหมด</CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-muted-foreground text-xs">หลักสูตร</p>
            </>
          )}
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
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalMilestones}</div>
              <p className="text-muted-foreground text-xs">รายการ</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
