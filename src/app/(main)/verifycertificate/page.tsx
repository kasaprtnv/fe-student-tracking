'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { studentStepProgressService } from '@/services/student-step-progress.service';
import { courseStaffService } from '@/services/course-staff.service';
import { courseService } from '@/services/course.service';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { DataTableClickable } from '@/components/data-table/data-table-clickable';
import { createVerifyColumns } from './verify-columns';

export default function VerifyCertificatePage() {
  const t = useTranslations('verify-certificate');
  const router = useRouter();
  const { user, initialized } = useAuth();
  const locale = useLocale();

  useEffect(() => {
    if (!initialized) return;
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, initialized, router]);

  const [data, setData] = useState<IStudentStepProgress[]>([]);
  const [managedCourseIds, setManagedCourseIds] = useState<string[]>([]);
  const [managedCourseCodes, setManagedCourseCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fetch teacher's managed courses
  useEffect(() => {
    const fetchManagedCourses = async () => {
      if (!user?.id || user.role === 'admin') return;

      try {
        const response = await courseStaffService.getCourseStaffByUserId(
          user.id,
        );
        const courseIds = (response.data || []).map((cs) => cs.courseId);
        setManagedCourseIds(courseIds);

        // ดึง all courses แล้ว filter เฉพาะที่ดูแล เพื่อเอา courseCode
        if (courseIds.length > 0) {
          const allCoursesRes = await courseService.getAllCourses();
          const allCourses = allCoursesRes.data || [];
          const codes = allCourses
            .filter((c) => courseIds.includes(c.id))
            .map((c) => c.code);
          setManagedCourseCodes(codes);
        }
      } catch (error) {
        console.error('Error fetching managed courses:', error);
        setManagedCourseIds([]);
        setManagedCourseCodes([]);
      }
    };

    if (initialized && user) {
      fetchManagedCourses();
    }
  }, [user, initialized]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch only pending approval
      const response = await studentStepProgressService.getAll({
        status: 'pending approval',
      });
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort data
  const displayData = useMemo(() => {
    const filtered = data.filter((item) => {
      // Filter by teacher's managed courses (skip for admin)
      if (user?.role === 'teacher') {
        // If teacher doesn't manage any course, don't show anything
        if (managedCourseIds.length === 0 && managedCourseCodes.length === 0) {
          return false;
        }

        // Check if student's course matches teacher's managed courses
        const studentCourseId = item.student?.courseId;
        const studentCourseCode =
          item.courseCode || item.student?.courseCode || '';

        // Match by courseId OR courseCode
        const matchesByCourseId =
          studentCourseId && managedCourseIds.includes(studentCourseId);
        const matchesByCourseCode =
          studentCourseCode && managedCourseCodes.includes(studentCourseCode);

        if (!matchesByCourseId && !matchesByCourseCode) {
          return false;
        }
      }

      const studentCode = item.studentCode || item.student?.code || '';
      const studentName =
        item.studentName ||
        `${item.student?.firstName || ''} ${item.student?.lastName || ''}`;
      const stepName = item.stepName || item.step?.name || '';
      const courseName = item.courseName || item.student?.courseName || '';

      // Search filter
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        studentCode.toLowerCase().includes(lowerQuery) ||
        studentName.toLowerCase().includes(lowerQuery) ||
        stepName.toLowerCase().includes(lowerQuery) ||
        courseName.toLowerCase().includes(lowerQuery);

      // Date range filter
      let matchesDateRange = true;
      if (startDate || endDate) {
        const submitDate = item.submittedAt ? new Date(item.submittedAt) : null;
        if (submitDate) {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (submitDate < start) matchesDateRange = false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (submitDate > end) matchesDateRange = false;
          }
        } else {
          matchesDateRange = false;
        }
      }

      return matchesSearch && matchesDateRange;
    });

    // Sort by submit date (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [
    data,
    searchQuery,
    startDate,
    endDate,
    user,
    managedCourseIds,
    managedCourseCodes,
  ]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/verifycertificate/${id}`);
    },
    [router],
  );

  const columns = useMemo(
    () => createVerifyColumns(t, handleView, locale),
    [t, handleView, locale],
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: t('breadcrumb.verify'), isPage: true }]}
      />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <DataTableClickable
          columns={columns}
          data={displayData}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          enabledPagination={true}
          enabledMultiSelect={false}
          extraToolbarAction={() => (
            <div className="flex items-center gap-4">
              {/* Status dropdown removed, only date picker remains */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[280px] justify-start text-left font-normal',
                      !startDate && !endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate && endDate ? (
                      <>
                        {format(startDate, 'dd MMM yyyy', { locale: th })} -{' '}
                        {format(endDate, 'dd MMM yyyy', { locale: th })}
                      </>
                    ) : startDate ? (
                      <>
                        {format(startDate, 'dd MMM yyyy', { locale: th })} - ...
                      </>
                    ) : endDate ? (
                      <>
                        ... - {format(endDate, 'dd MMM yyyy', { locale: th })}
                      </>
                    ) : (
                      <span>{t('filter.select_date_range')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-2">
                    <Calendar
                      mode="range"
                      selected={
                        startDate || endDate
                          ? { from: startDate, to: endDate }
                          : undefined
                      }
                      onSelect={(range) => {
                        setStartDate(range?.from);
                        setEndDate(range?.to);
                      }}
                      numberOfMonths={1}
                      initialFocus
                    />
                  </div>
                  {(startDate || endDate) && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setStartDate(undefined);
                          setEndDate(undefined);
                        }}
                      >
                        {t('filter.clear')}
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
        />
      </div>
    </>
  );
}
