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
  actionHeaderId?: string;
}

export function DataTable<TData, TValue>({
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
  getRowId,
  setHiddenColumns,
  actionHeader,
  actionHeaderId,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('data-table');
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
        </div>
        <div className="flex items-center gap-4">
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
