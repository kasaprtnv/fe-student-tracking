'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { IStudentStepProgress } from '@/types/student-step-progress';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { DataTableClickable } from '@/components/data-table/data-table-clickable';
import { createVerifyColumns } from './verify-columns';

export default function VerifyCertificatePage() {
  const t = useTranslations('verify-certificate');
  const router = useRouter();
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, initialized, router]);

  const [data, setData] = useState<IStudentStepProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Only show pending approval status
  const [statusFilter, setStatusFilter] = useState<string>('pending approval');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
  }, [data, searchQuery, startDate, endDate]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/verifycertificate/${id}`);
    },
    [router],
  );

  const columns = useMemo(
    () => createVerifyColumns(t, handleView),
    [t, handleView],
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
      <div className="container mx-auto pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        </div>

        <DataTableClickable
          columns={columns}
          data={displayData}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          enabledPagination={true}
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
                  <div className="flex">
                    <div className="border-r p-2">
                      <p className="mb-2 text-center text-sm font-medium">
                        {t('filter.start_date')}
                      </p>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </div>
                    <div className="p-2">
                      <p className="mb-2 text-center text-sm font-medium">
                        {t('filter.end_date')}
                      </p>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) =>
                          startDate ? date < startDate : false
                        }
                      />
                    </div>
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
