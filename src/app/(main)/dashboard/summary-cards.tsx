'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SummaryCardsProps {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  isLoading: boolean;
}

export function SummaryCards({
  totalStudents,
  totalTeachers,
  totalCourses,
  isLoading,
}: SummaryCardsProps) {
  const t = useTranslations('dashboard.summary-cards');

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('total-students')}
          </CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-muted-foreground text-xs">
                {t('unit-people')}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('total-teachers')}
          </CardTitle>
          <GraduationCap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalTeachers}</div>
              <p className="text-muted-foreground text-xs">
                {t('unit-people')}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('total-courses')}
          </CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-muted-foreground text-xs">
                {t('unit-courses')}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
