import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataTableFilterField } from './types';
import { useTranslations } from 'next-intl';
import React from 'react';
import { DataTableFilter } from './data-table-filter';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { Button } from '../ui/button';
import { ArrowDown, ArrowDownUp, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { DataTableViewOptions } from './data-table-view-options';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { DataTablePagination } from './data-table-pagination';
import { Input } from '../ui/input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enabledSearch?: boolean;
  searchQuery?: string;
  searchPlaceholder?: string;
  enabledMultiSelect?: boolean;
  buttonAddLabel?: string;
  buttonFilterLabel?: string;
  enabledSelectColumns?: boolean;
  enabledPagination?: boolean;
  manualPagination?: boolean;
  page?: number;
  pageSize?: number;
  rowCount?: number;
  pageSizeOptions?: number[];
  filterColumns?: DataTableFilterField<TData>[];
  onFilter?: () => void;
  onAdd?: () => void;
  onEdit?: (data: TData) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDeleteData?: (data: TData) => void;
  onLink?: (data: string) => void;
  onMultiDelete?: (data: TData[]) => void;
  onMultiDeleteIds?: (ids: string[]) => void;
  onActiveChange?: (id: string, inactive: boolean) => void;
  onSearch?: (value: string) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onPageChange?: (page: number) => void;
  getRowId?: (data: TData) => string;
  setHiddenColumns?: (
    hiddenColumns: Column<TData, unknown>[],
  ) => Column<TData, unknown>[];
  actionHeader?: React.ReactNode;
  extraToolbarAction?:
    | React.ReactNode
    | ((
        table: import('@tanstack/react-table').Table<TData>,
      ) => React.ReactNode);
  actionHeaderId?: string;
}

export function DataTableClickable<TData, TValue>({
  columns,
  data,
  enabledSearch = true,
  searchQuery = '',
  searchPlaceholder = 'search_placeholder',
  enabledMultiSelect = true,
  buttonAddLabel = 'add',
  buttonFilterLabel = 'filter',
  enabledSelectColumns = true,
  enabledPagination = true,
  manualPagination = false,
  page = 1,
  pageSize = 10,
  rowCount,
  pageSizeOptions,
  filterColumns = [],
  onFilter,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onDeleteData,
  onLink,
  onMultiDelete,
  onMultiDeleteIds,
  onActiveChange,
  onSearch,
  onPageSizeChange,
  onPageChange,
  extraToolbarAction,
  getRowId,
  setHiddenColumns,
  actionHeader,
  actionHeaderId,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('data-table');
  // ... (unchanged code) ...
  // ... (we need to skip until rendering part) ...
  /* Since replace_file_content is contiguous, I must include lines between prop def and usage or use multiple replaces.
     Wait, I can just replace the interface definition and the rendering part separately?
     No, function signature also changed in props destructuring (Wait, destructuring is fine as extraToolbarAction name is same).
     But I need to change the usage site.
     Let's do this in 2 steps or careful block selection.
     Line 1 is imports. Line 34 is interface. Line 73 is function start. Line 232 is usage.
     I cannot bridge 34 and 232.
  */

  const [searchValue, setSearchValue] = React.useState(searchQuery);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: pageSize,
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId,
    autoResetPageIndex: false,
    manualPagination,
    rowCount,
    defaultColumn: {
      sortDescFirst: false,
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    meta: {
      t,
      onEdit,
      onView,
      onDelete,
      onDeleteData,
      onLink,
      onActiveChange,
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
      table.resetPageIndex();
      return;
    }
    table.setGlobalFilter(value);
    table.resetPageIndex();
  };

  const handleMultiDelete = () => {
    if (onMultiDelete) {
      const selectedItem = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);

      onMultiDelete(selectedItem);
    } else if (onMultiDeleteIds && getRowId) {
      const ids = Object.keys(rowSelection).map((key) => key);
      onMultiDeleteIds(ids);
    }

    setRowSelection({});
  };

  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {enabledSearch && (
            <Input
              placeholder={t(searchPlaceholder)}
              value={searchValue}
              onChange={handleSearch}
              className="input border-foreground/10 bg-background/50 focus:border-primary focus:ring-primary h-8 w-full max-w-sm px-3 py-2 text-sm placeholder:opacity-50 focus:ring-1"
            />
          )}
          {filterColumns.length > 0 && (
            <>
              {filterColumns.length > 2 ? (
                <DataTableFilter
                  table={table}
                  filterColumns={filterColumns}
                  title={t('filter')}
                />
              ) : (
                <>
                  {filterColumns.map(
                    (column) =>
                      table.getColumn(column.id ? String(column.id) : '') && (
                        <DataTableFacetedFilter
                          key={String(column.id)}
                          column={table.getColumn(
                            column.id ? String(column.id) : '',
                          )}
                          title={column.label}
                          options={column.options ?? []}
                        />
                      ),
                  )}
                  {isFiltered && (
                    <Button
                      aria-label="Reset filters"
                      variant="outline"
                      className="h-8 px-2 lg:px-3"
                      onClick={() => table.resetColumnFilters()}
                    >
                      {t('reset_filters')}
                      <X className="ml-2 size-4" aria-hidden="true" />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
          {actionHeader}
        </div>
        <div className="flex items-center gap-2">
          {typeof extraToolbarAction === 'function'
            ? extraToolbarAction(table)
            : extraToolbarAction}
          {enabledMultiSelect && Object.keys(rowSelection).length > 0 && (
            <Button onClick={handleMultiDelete} variant="destructive">
              <Trash2 />
              {t('delete_selected', {
                count: Object.keys(rowSelection).length,
              })}
            </Button>
          )}
          {onFilter && (
            <Button onClick={onFilter} variant="outline">
              {t(buttonFilterLabel)}
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} variant="outline">
              <Plus /> {t(buttonAddLabel)}
            </Button>
          )}
          {enabledSelectColumns && (
            <DataTableViewOptions
              table={table}
              setHiddenColumns={setHiddenColumns}
            />
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <ScrollArea>
          <Table>
            <TableHeader className="bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {enabledMultiSelect && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) =>
                          table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all rows"
                      />
                    </TableHead>
                  )}
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          {header.id === actionHeaderId && actionHeader ? (
                            actionHeader
                          ) : (
                            <div className="flex items-center text-xs font-semibold">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {header.column.getCanSort() && (
                                <Button
                                  variant="ghost"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {header.column.getIsSorted() === 'desc' ? (
                                    <ArrowDown className="size-4" />
                                  ) : header.column.getIsSorted() === 'asc' ? (
                                    <ArrowUp className="size-4" />
                                  ) : (
                                    <ArrowDownUp className="size-4" /> // แสดง icon default
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-white">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={
                      enabledMultiSelect
                        ? row.getIsSelected() && 'selected'
                        : false
                    }
                    className={
                      onView
                        ? 'hover:bg-muted/50 h-[60px] cursor-pointer transition-colors'
                        : 'h-[49px]'
                    }
                    onClick={(e) => {
                      if (!onView) return;
                      // Prevent navigation when clicking interactive elements
                      if (
                        (e.target as HTMLElement).closest('button') ||
                        (e.target as HTMLElement).closest('input') ||
                        (e.target as HTMLElement).closest(
                          '[role="checkbox"]',
                        ) ||
                        (e.target as HTMLElement).closest('a')
                      ) {
                        return;
                      }

                      // Try to find an ID. Assuming TData has an id property or similar.
                      // Since we can't be sure of TData shape, we cast to any.
                      const entity = row.original as Record<string, unknown>;
                      const entityId = (entity?.id ?? entity?._id) as
                        | string
                        | undefined;
                      if (entityId) {
                        onView(entityId);
                      }
                    }}
                  >
                    {enabledMultiSelect && (
                      <TableCell className="w-[50px]">
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        width={cell.column.columnDef.size}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    {t('no_results')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {enabledPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          enableMuitiSelect={enabledMultiSelect}
          manualPagination={manualPagination}
          onPageSizeChange={onPageSizeChange}
          onPageChange={(pageIndex) => onPageChange?.(pageIndex + 1)} // เพิ่ม +1
        />
      )}
    </div>
  );
}
