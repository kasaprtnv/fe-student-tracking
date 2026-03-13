import { cn } from '@/lib/utils';
import { IStepProgressReport } from '@/types/step-progress-report';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { mixedThEnTextSort } from '@/lib/table-sorted';
import { formatShortDate } from '@/lib/format-date';

export const createStepProgressReportColumns = (
  tStatus: (key: string) => string,
  tDegree: (key: string) => string,
  locale: string = 'th',
): ColumnDef<IStepProgressReport>[] => {
  const degreeMap = getDegreeMap(tDegree);
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
      accessorKey: 'studentMajor',
      header: 'major',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'studentDegree',
      header: 'degree',
      filterFn: (row, columnId, filterValue) => {
        const raw = row.getValue<string | null>(columnId);
        if (!raw) return false;
        const translated = (degreeMap[raw] ?? raw).toLowerCase();
        const filter = String(filterValue).toLowerCase();
        return (
          translated.includes(filter) || raw.toLowerCase().includes(filter)
        );
      },
      cell: ({ row }) => {
        const degree = row.original.studentDegree;
        return degreeMap[degree] || degree || '-';
      },
    },
    {
      accessorKey: 'studentYear',
      header: 'year',
      sortingFn: 'basic',
    },
    {
      accessorKey: 'courseName',
      header: 'course',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'milestoneName',
      header: 'milestone',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'stepName',
      header: 'milestone-step',
      sortingFn: mixedThEnTextSort<IStepProgressReport>(),
    },
    {
      accessorKey: 'status',
      header: 'status',
      filterFn: (row, columnId, filterValue) => {
        const rawStatus = row.getValue<string>(columnId);
        const translatedStatus = tStatus(rawStatus).toLowerCase();
        const filter = String(filterValue).toLowerCase();
        return (
          translatedStatus.includes(filter) ||
          rawStatus.toLowerCase().includes(filter)
        );
      },
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
      filterFn: (row, columnId, filterValue) => {
        const rawDate = row.getValue<string>(columnId);
        if (!rawDate) return false;
        const formatted = formatShortDate(rawDate, locale).toLowerCase();
        return formatted.includes(String(filterValue).toLowerCase());
      },
      cell: (row) => {
        const rawDate = row.getValue<string>();
        if (!rawDate) return <span>-</span>;
        return formatShortDate(rawDate, locale);
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

const getDegreeMap = (
  tDegree: (key: string) => string,
): Record<string, string> => ({
  bachelor: tDegree('bachelor'),
  master: tDegree('master'),
  doctorate: tDegree('doctorate'),
});
