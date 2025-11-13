"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import * as React from "react";
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
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { table } from "console";

const initialData: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@example.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@example.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@example.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqecj4rp",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqec3j4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqec4j4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqe2cj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqec1j4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqecj45p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "6bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqec7j4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqecj48p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqec1j4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqecj44p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
  {
    id: "bhqec3j4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
];

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columnss: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")} </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
            // onClick={() => navigator.clipboard.writeText(payment)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// add test columns to create horizontal scroll
const extraTestColumns: ColumnDef<Payment>[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    id: `test_col_${i + 1}`,
    header: `Test ${i + 1}`,
    // simple cell rendering - show email and column index so values differ
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.email} — c{i + 1}
      </div>
    ),
    size: 160,
    minSize: 120,
  })
);

export const columns: ColumnDef<Payment>[] = [...extraTestColumns, ...columnss];

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<Payment[]>(initialData);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isDeleteDialogopen, setIsDeleteDialogOpen] = React.useState(false);
  const [newPayment, setNewPayment] = React.useState<Partial<Payment>>({
    status: "pending",
    amount: undefined,
    email: "",
  });

  type Status = {
    value: string;
    label: string;
  };
  const statuses: Status[] = [
    {
      label: "Pending",
      value: "pending",
    },
    {
      label: "Processing",
      value: "processing",
    },
    {
      label: "Success",
      value: "success",
    },
    {
      label: "Failed",
      value: "failed",
    },
  ];
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );

  const resetForm = () => {
    setNewPayment({ status: "pending", amount: undefined, email: "" });
    setSelectedStatus(null);
    setOpen(false);
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDelete = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert("Please select rows to delete");
      return;
    }
    const selectedIds = selectedRows.map((row) => row.original.id);
    const newData = data.filter((item) => !selectedIds.includes(item.id));
    setData(newData);
    table.resetRowSelection();
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    autoResetPageIndex: false, // ป้องกันการรีเซ็ตหน้าเมื่อ filter/sort เปลี่ยน
  });

  interface Artwork {
    artist: string;
    art: string;
  }
  const works: Artwork[] = [
    {
      artist: "Ornella Binni",
      art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80",
    },
    {
      artist: "Tom Byrom",
      art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80",
    },
    {
      artist: "Vladimir Malyavko",
      art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex ml-30">
          {/* เพิ่มปุ่ม Add ก่อน Input filter */}
          <Button
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="mr-4"
          >
            Add New
          </Button>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  value={newPayment.email}
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
                  value={newPayment.amount ?? ""}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      amount:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2 ">
                <Label htmlFor="status">Status</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
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
                    className="p-0 w-[370px]"
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
                                    (priority) => priority.value === value
                                  ) || null
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
                    alert("Please fill email, amount and status");
                    return;
                  }
                  const payload = {
                    email: newPayment.email,
                    amount: Number(newPayment.amount),
                    status: selectedStatus.value,
                  };
                  setIsSubmitting(true);
                  try {
                    const response = await fetch("/api/create", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
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
                {isSubmitting ? "Adding..." : "Add Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="ml-auto">
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
      <div className="overflow-hidden rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === "actions"
                        ? "sticky right-0 z-10 bg-background rounded-xl"
                        : ""
                    }
                    style={
                      header.column.id === "actions" ? { right: 0 } : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>;
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions"
                          ? "sticky right-0 z-10 bg-background rounded-xl"
                          : ""
                      }
                      style={
                        cell.column.id === "actions" ? { left: 0 } : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
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
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
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
          <span className=" items-center space-x-2 px-2 text-sm">
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
