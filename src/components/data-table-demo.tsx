'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStudent } from '@/hooks/use-student';
import { Student } from '@/types/student';

export function DataTableDemo() {
  // เชื่อมกับ Student Store
  const {
    importMultipleStudents,
    getAllFromCache,
    fetchAllStudents,
    loader: isImporting,
    error: importError,
  } = useStudent();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<Student[]>([]);

  // สร้าง default columns
  const defaultColumns: ColumnDef<Student>[] = React.useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'code',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Code
            <ArrowUpDown />
          </Button>
        ),
      },
      {
        accessorKey: 'firstName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            First Name
            <ArrowUpDown />
          </Button>
        ),
      },
      {
        accessorKey: 'lastName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last Name
            <ArrowUpDown />
          </Button>
        ),
      },
      {
        accessorKey: 'degree',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Degree
            <ArrowUpDown />
          </Button>
        ),
      },
      {
        id: 'actions',
        size: 80,
        enableResizing: false,
        enableHiding: false,
        header: () => null,
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const [dynamicColumns, setDynamicColumns] =
    React.useState<ColumnDef<Student>[]>(defaultColumns);
  const [isDeleteDialogopen, setIsDeleteDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newPayment, setNewPayment] = React.useState<
    Partial<Record<string, unknown>>
  >({
    status: 'pending',
    amount: undefined,
    email: '',
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  type Status = {
    value: string;
    label: string;
  };
  const statuses: Status[] = [
    {
      label: 'Pending',
      value: 'pending',
    },
    {
      label: 'Processing',
      value: 'processing',
    },
    {
      label: 'Success',
      value: 'success',
    },
    {
      label: 'Failed',
      value: 'failed',
    },
  ];
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // โหลดข้อมูลจาก Backend ตอน component mount
  React.useEffect(() => {
    const loadStudents = async () => {
      try {
        console.log('Fetching students from backend...');
        const students = await fetchAllStudents();
        console.log('Fetched students:', students);
        setData(students);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        // Fallback to cache if API fails
        const cachedStudents = getAllFromCache();
        if (cachedStudents.length > 0) {
          console.log('Using cached students:', cachedStudents);
          setData(cachedStudents);
        }
      }
    };

    loadStudents();
  }, [fetchAllStudents, getAllFromCache]);

  const resetForm = () => {
    setNewPayment({ status: 'pending', amount: undefined, email: '' });
    setSelectedStatus(null);
    setOpen(false);
  };

  const handleDelete = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select rows to delete');
      return;
    }
    const selectedIds = selectedRows.map((row) => row.original.id);
    const newData = data.filter((item) => !selectedIds.includes(item.id));
    setData(newData);
    table.resetRowSelection();
  };

  const handleFileUpload = async (file: File) => {
    try {
      // ตรวจสอบ file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(xlsx|xls)$/)
      ) {
        alert('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false,
      });

      if (workbook.SheetNames.length === 0) {
        alert('Excel file contains no sheets');
        return;
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: '',
        blankrows: false,
      }) as unknown[][];

      if (jsonData.length < 2) {
        alert('Excel file must contain headers and at least one row of data');
        return;
      }

      // แยก headers และ data
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);

      // สร้าง objects จาก rows
      const dataObjects = rows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ?? '';
        });
        return obj;
      });

      console.log('Excel Headers:', headers);
      console.log('Parsed data:', dataObjects);

      // แปลงเป็น Student format สำหรับบันทึก DB (ใช้เฉพาะ fields ที่มีใน Student type)
      const studentsToImport: Omit<Student, 'id'>[] = dataObjects.map((row) => {
        const student: Omit<Student, 'id'> = {
          code:
            String(row.code || row.Code || row['รหัสนักศึกษา'] || '').trim() ||
            '',
          firstName:
            String(
              row.firstName ||
                row.first_name ||
                row['First Name'] ||
                row['ชื่อ'] ||
                '',
            ).trim() || '',
          lastName:
            String(
              row.lastName ||
                row.last_name ||
                row['Last Name'] ||
                row['นามสกุล'] ||
                '',
            ).trim() || '',
          degree:
            String(
              row.degree || row.Degree || row['ระดับการศึกษา'] || '',
            ).trim() || undefined,
        };

        console.log('Mapped student:', student);
        return student;
      });

      // Import เข้า database
      const importedStudents = await importMultipleStudents(studentsToImport);

      console.log('Imported students:', importedStudents);

      // ใช้ข้อมูลที่ import สำเร็จมาแสดงทันที
      if (importedStudents && importedStudents.length > 0) {
        // รวมข้อมูลเดิมกับข้อมูลใหม่
        setData((prevData) => [...prevData, ...importedStudents]);
      } else {
        // ถ้าไม่มี return มา ให้ดึงจาก cache
        const cachedStudents = getAllFromCache();
        console.log('Cached students:', cachedStudents);
        setData(cachedStudents);
      }

      // สร้าง columns จาก Student type fields
      const studentFields: (keyof Student)[] = [
        'code',
        'firstName',
        'lastName',
        'degree',
      ];

      // สร้าง columns definition
      const newColumns: ColumnDef<Student>[] = [
        {
          id: 'select',
          size: 50,
          enableResizing: false,
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...studentFields.map((key) => ({
          accessorKey: key,
          size: 200,
          minSize: 100,
          maxSize: 500,
          enableResizing: true,
          header: ({
            column,
          }: {
            column: {
              toggleSorting: (asc: boolean) => void;
              getIsSorted: () => string | false;
            };
          }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {key}
              <ArrowUpDown />
            </Button>
          ),
          cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
            const value = String(row.getValue(key) || '');
            return (
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {value}
              </div>
            );
          },
        })),
        {
          id: 'actions',
          size: 80,
          enableResizing: false,
          enableHiding: false,
          header: () => null, // ไม่แสดงหัวตาราง
          cell: () => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ];

      // อัปเดต columns และ data ให้แสดงใน DataTable
      setDynamicColumns(newColumns);

      setIsImportDialogOpen(false);
      alert(`Imported ${studentsToImport.length} students successfully!`);
    } catch (error) {
      console.error('File upload error:', error);

      // แสดง error message ที่ละเอียดขึ้น
      let errorMessage =
        'Failed to read Excel file. Please check the file format.';

      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        console.error('Error details:', error);
      }

      alert(errorMessage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const table = useReactTable({
    data,
    columns: dynamicColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    autoResetPageIndex: false, // ป้องกันการรีเซ็ตหน้าเมื่อ filter/sort เปลี่ยน
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto flex gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>

          {/* Add New Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
              >
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={String(newPayment.email || '')}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount ?? ''}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        amount:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {selectedStatus ? (
                          <>{selectedStatus.label}</>
                        ) : (
                          <div className="text-muted-foreground">
                            Select status
                          </div>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[370px] p-0"
                      side="bottom"
                      align="start"
                    >
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {statuses.map((status) => (
                              <CommandItem
                                key={status.value}
                                value={status.value}
                                onSelect={(value) => {
                                  setSelectedStatus(
                                    statuses.find(
                                      (priority) => priority.value === value,
                                    ) || null,
                                  );
                                  setOpen(false);
                                }}
                              >
                                {status.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (
                      !newPayment.email ||
                      newPayment.amount == null ||
                      !selectedStatus
                    ) {
                      alert('Please fill email, amount and status');
                      return;
                    }
                    const payload = {
                      email: newPayment.email,
                      amount: Number(newPayment.amount),
                      status: selectedStatus.value,
                    };
                    setIsSubmitting(true);
                    try {
                      const response = await fetch('/api/create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                      });

                      if (!response.ok) {
                        // throw new Error('Fail to create');
                      }
                    } catch (error) {
                      // console.error("Error to create", error);
                      // alert("Error to create");
                    }
                    resetForm();
                    setIsAddDialogOpen(false);
                    setIsSubmitting(false);
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteDialogopen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={
                    table.getFilteredSelectedRowModel().rows.length === 0
                  }
                >
                  Delete({table.getFilteredSelectedRowModel().rows.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Student</DialogTitle>
                  <DialogDescription>
                    Make sure na krub u want to delete this cute student.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    variant="destructive"
                    onClick={async () => {
                      handleDelete();
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>

      {/* Import Excel Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Excel File</DialogTitle>
            <DialogDescription>
              Upload an Excel file (.xlsx, .xls)
            </DialogDescription>
          </DialogHeader>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/25'
            }`}
          >
            <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="mb-2 text-lg font-medium">
              Drag and drop your Excel file here
            </p>
            <p className="text-muted-foreground mb-4 text-sm">or</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={dynamicColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="items-center space-x-2 px-2 text-sm">
            <span>Page</span>
            <strong>{table.getState().pagination.pageIndex + 1}</strong>
            <span>of</span>
            <strong>{table.getPageCount()}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
