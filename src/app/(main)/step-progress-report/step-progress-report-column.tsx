import { formatThaiDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { IStepProgressReport } from '@/types/step-progress-report';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { mixedThEnTextSort } from '@/lib/table-sorted';

export const createStepProgressReportColumns = (
  tStatus: (key: string) => string,
): ColumnDef<IStepProgressReport>[] => {
  const columns: ColumnDef<IStepProgressReport>[] = [
    {
      accessorKey: 'studentCode',
      header: 'student-code',
      sortingFn: 'basic',
    },
    {
      header: 'full-name',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),

      accessorFn: (row) => {
        const fullName =
          `${row.studentFirstName} ${row.studentLastName}`.trim();
        return fullName || '-';
      },
    },
    {
      accessorKey: 'courseName',
      header: 'course-name',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'milestoneName',
      header: 'milestone-name',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'stepName',
      header: 'step-name',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'status',
      header: 'status',
      cell: (info) => {
        const rawStatus = info.getValue<string>();
        const color = statusColor(rawStatus);
        return (
          <Badge className={cn(color, 'min-w-[80px] px-2 py-1 text-center')}>
            {tStatus(rawStatus)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'due-date',
      sortingFn: 'datetime',
      cell: (info) => {
        const rawDate = info.getValue<string>();
        if (!rawDate) return '-';
        const localDate = formatThaiDate(rawDate);
        return <span>{localDate}</span>;
      },
    },
  ];
  return columns;
};

const statusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    locked: 'bg-gray-300 text-gray-800',
    'pending approval': 'bg-yellow-300 text-yellow-800',
    declined: 'bg-red-300 text-red-800',
    approved: 'bg-green-300 text-green-800',
    available: 'bg-blue-300 text-blue-800',
  };
  return colorMap[status] || '';
};
