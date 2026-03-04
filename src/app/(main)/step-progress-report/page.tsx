'use client';
import { PageHeader } from '@/components/page-header';
import { useCourse } from '@/hooks/use-course';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { FilterStepProgressReportForm } from './step-progress-report-filter-form';
import { DataTable } from '@/components/data-table/data-table';
import { createStepProgressReportColumns } from './step-progress-report-column';
import {
  IStepProgressReport,
  IStepProgressReportFilter,
} from '@/types/step-progress-report';
import { useStepProgressReport } from '@/hooks/use-step-progress-report';
import React from 'react';
import { Search } from 'lucide-react';
import { SkeletonTable } from '@/components/loading-skeleton-table';
import { exportToExcel } from './export-step-progress-report';
import { useAuth } from '@/hooks/use-auth';

const StepProgressReportPage = () => {
  const tProgressReport = useTranslations('step-progress-report');
  const locale = useLocale();

  const tDegree = useTranslations('degree');
  const tColumn = useTranslations('column');
  const tStatus = useTranslations('status');

  const { fetchCoursesByTeacherId } = useCourse();
  const { user } = useAuth();
  const { fetchStepProgressReportByFilter, loader } = useStepProgressReport();

  const [reportData, setReportData] = React.useState<IStepProgressReport[]>([]);
  const [isApplyingFilter, setIsApplyingFilter] =
    React.useState<boolean>(false);

  const reportColumn = createStepProgressReportColumns(
    tStatus,
    tDegree,
    locale,
  ).map((column) => {
    if (typeof column.header === 'string') {
      return {
        ...column,
        header: tColumn(column.header),
      };
    }
    return column;
  });

  useSWR(
    user?.id ? `fetch-milestones-${user.id}` : null,
    async () => {
      console.log('Fetching courses for teacher ID:', user!.id);
      await fetchCoursesByTeacherId(user!.id);
    },
    { revalidateOnFocus: false },
  );

  const currentYear = new Date().getFullYear() + 543;
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    return {
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString(),
    };
  });

  const degreeOptions = [
    { label: tDegree('master'), value: 'master' },
    { label: tDegree('doctorate'), value: 'doctorate' },
  ];

  const statusOptions = [
    { label: tStatus('locked'), value: 'locked' },
    { label: tStatus('pending approval'), value: 'pending_approval' },
    { label: tStatus('declined'), value: 'declined' },
    { label: tStatus('approved'), value: 'approved' },
    { label: tStatus('available'), value: 'available' },
  ];

  const onSubmit = async (data: IStepProgressReportFilter) => {
    try {
      const result = await fetchStepProgressReportByFilter(data);
      setReportData(result);
      setIsApplyingFilter(true);
    } catch (error) {
      console.error('Error fetching step progress report:', error);
    }
  };

  const onExportExcel = () => {
    exportToExcel(
      reportData,
      {
        tColumn,
        tStatus,
      },
      'step-progress-report.xlsx',
    );
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tProgressReport('title'), isPage: true }]}
      />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            {tProgressReport('title')}
          </h1>
          <p className="text-muted-foreground">
            {tProgressReport('sub_title')}
          </p>
        </div>
        {/* Filter Form */}
        <div className="w-full">
          <FilterStepProgressReportForm
            yearOptions={yearOptions}
            degreeOptions={degreeOptions}
            statusOptions={statusOptions}
            onApplyFilter={onSubmit}
            onExportExcel={onExportExcel}
          />
        </div>
        {isApplyingFilter ? (
          <>
            {loader ? (
              <div className="flex flex-col items-center justify-center">
                <SkeletonTable
                  rows={8}
                  cols={reportColumn.length}
                  showHeader={false}
                />
              </div>
            ) : (
              <div>
                <DataTable
                  columns={reportColumn}
                  data={reportData}
                  enabledMultiSelect={false}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border bg-white py-24">
            <Search className="mb-6 h-32 w-32 text-gray-300" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">
              {tProgressReport('please-select-filters')}
            </h2>
            <p className="text-center text-gray-400">
              {tProgressReport('filter_instruction-line-1')}
              <br />
              {tProgressReport('filter_instruction-line-2')}
              <br />
              {tProgressReport('filter_instruction-line-3')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default StepProgressReportPage;
