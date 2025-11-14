import { DataTableDemo } from '@/components/data-table-demo';

export default function DataTablePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Data Table Demo</h1>
        <p className="text-muted-foreground">
          Explore the data table with filtering, sorting, and pagination
        </p>
      </div>
      <DataTableDemo />
    </div>
  );
}
