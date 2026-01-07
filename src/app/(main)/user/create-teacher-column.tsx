import { User } from '@/types/user';
import { formatPhoneNumber } from '@/lib/format-phone';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';

interface ColumnActions {
  onEdit?: (data: User) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, isActive: boolean) => void;
  t?: (key: string) => string;
}

export const createTeacherColumns = (
  t: (key: string) => string,
): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [
    {
      header: t('full-name'),
      accessorFn: (row) => {
        const titleName = `${row.title || ''}${row.firstName || ''}`.trim();
        const lastName = row.lastName || '';
        return `${titleName} ${lastName}`.trim() || '-';
      },
    },
    {
      header: t('email'),
      accessorKey: 'email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: t('phone'),
      cell: ({ row }) => formatPhoneNumber(row.original.phone),
    },
    {
      header: t('teacher-degree'),
      accessorKey: 'teacherDegree',
      cell: ({ row }) => row.original.teacherDegree || '-',
    },
    {
      header: t('managed-courses'),
      accessorKey: 'managedCourses',
      cell: ({ row }) => {
        const rowData = row.original as User & { managedCourses?: string[] };
        const courses = rowData.managedCourses;
        if (!courses || courses.length === 0) return '-';
        return (
          <div className="flex flex-col gap-1">
            {courses.map((course, index) => (
              <span key={index} className="text-sm">
                {course}
              </span>
            ))}
          </div>
        );
      },
    },
  ];
  columns.push({
    id: 'actions',
    size: 40,
    cell: ({ row, table }) => {
      const record = row.original;
      const { onEdit, onDelete, t } = table.options.meta as ColumnActions;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="data-[state=open]:bg-muted flex size-8 p-0"
            >
              <Ellipsis className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <>
                <DropdownMenuItem onSelect={() => onEdit(record)}>
                  <div className="flex items-center gap-2">
                    <Pencil size={14} />
                    {t?.('edit')}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {onDelete && (
              <DropdownMenuItem onSelect={() => onDelete(record.id)}>
                <div className="flex items-center gap-2">
                  <Trash2 size={14} color="#e7000b" />
                  {t?.('delete')}
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  });

  return columns;
};
