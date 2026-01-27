'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/user';
import Link from 'next/link';

interface SummaryCardsProps {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  isLoading: boolean;
  userRole?: UserRole;
}

export function SummaryCards({
  totalStudents,
  totalTeachers,
  totalCourses,
  isLoading,
  userRole = 'admin',
}: SummaryCardsProps) {
  const t = useTranslations('dashboard.summary-cards');

  const isTeacher = userRole === 'teacher';

  return (
    <div
      className={`grid gap-4 ${isTeacher ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}
    >
      <Link href="/students" className="block">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isTeacher ? t('students-in-courses') : t('total-students')}
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
      </Link>
      {!isTeacher && (
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
      )}
      {userRole === 'admin' ? (
        <Link href="/course" className="block">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
        </Link>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('managed-courses')}
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
      )}
    </div>
  );
}
