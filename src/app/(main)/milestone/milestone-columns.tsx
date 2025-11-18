import { ColumnDef } from '@tanstack/react-table';
import { IMilestone } from '@/types/milestone';
import { Button } from '@/components/ui/button';

export interface MilestoneTableMeta {
  onEdit?: (m: IMilestone) => void;
  onDelete?: (id: string) => void;
  onActiveChange?: (id: string, v: boolean) => void;
}

export const createMilestoneColumns = (): ColumnDef<IMilestone, unknown>[] => [
  { accessorKey: 'name', header: 'name' },
  { accessorKey: 'description', header: 'description' },
  { accessorKey: 'courseId', header: 'courseId' },
  { accessorKey: 'position', header: 'position' },
  { accessorKey: 'deadlineDate', header: 'deadlineDate' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const m = row.original;
      const meta = table.options.meta as MilestoneTableMeta;

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => meta.onEdit?.(m)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => meta.onDelete?.(m.id)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
