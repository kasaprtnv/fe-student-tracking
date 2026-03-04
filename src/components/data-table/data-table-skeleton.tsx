import type { Table } from '@tanstack/react-table';
import React from 'react';

import { Skeleton } from '../ui/skeleton';
import { TableCell, TableRow } from '../ui/table';

interface DataTableSkeletonProps<TData, TValue> {
  table: Table<TData>;
  columns: { size?: number | string }[];
  enabledMultiSelect: boolean;
  pageSize: number;
}

export function DataTableSkeleton<TData, TValue>({
  table,
  columns,
  enabledMultiSelect,
  pageSize,
}: DataTableSkeletonProps<TData, TValue>) {
  const rows = table.getRowModel().rows;

  if (rows.length) {
    return (
      <>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {enabledMultiSelect && (
              <TableCell className="w-[50px]">
                <Skeleton className="h-6" />
              </TableCell>
            )}
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} width={cell.column.columnDef.size}>
                <Skeleton className="h-6" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: pageSize }).map((_, index) => (
        <TableRow key={index}>
          {enabledMultiSelect && (
            <TableCell className="w-[50px]">
              <Skeleton className="h-6" />
            </TableCell>
          )}
          {columns.map((column, columnIndex) => (
            <TableCell key={columnIndex} width={column.size}>
              <Skeleton className="h-6" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
