import { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { SelectValue } from '@radix-ui/react-select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  enableMuitiSelect?: boolean;
  manualPagination?: boolean;
  onPageSizeChange?: (pageSize: number) => void;
  onPageChange?: (page: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  enableMuitiSelect = false,
  manualPagination = false,
  onPageSizeChange,
  onPageChange,
}: DataTablePaginationProps<TData>) {
  const t = useTranslations('data-table');
  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
      <div className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
        {' '}
        {enableMuitiSelect && (
          <>
            {Object.keys(table.getState().rowSelection).length} {t('of')}{' '}
            {manualPagination
              ? `${table.getRowCount()} ${t('row_selected')}`
              : `${table.getFilteredRowModel().rows.length} ${t('row_selected')}`}
          </>
        )}
      </div>
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <span className="text-sm whitespace-nowrap">
            {t('rows_per_page')}
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const pageSize = Number(value);
              table.setPageSize(pageSize);
              if (onPageSizeChange) {
                onPageSizeChange(pageSize);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[4.5rem]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <p>{t('page')}</p>
          <Input
            type="number"
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const pageIndex = Number(e.target.value);
              if (pageIndex > table.getPageCount() || pageIndex < 1) return;
              table.setPageIndex(pageIndex - 1);
              if (onPageChange) {
                onPageChange(pageIndex - 1);
              }
            }}
            className="w-12 appearance-none text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <p className="m-0">of {table.getPageCount()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            size="icon"
            onClick={() => {
              table.setPageIndex(0);
              if (onPageChange) {
                onPageChange(0);
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              const pageIndex = table.getState().pagination.pageIndex - 1;
              table.previousPage();
              if (onPageChange) {
                onPageChange(pageIndex);
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              const pageIndex = table.getState().pagination.pageIndex - 1;
              table.nextPage();
              if (onPageChange) {
                onPageChange(pageIndex);
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            size="icon"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
              if (onPageChange) {
                onPageChange(table.getPageCount() - 1);
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
