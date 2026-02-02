import { Skeleton } from './ui/skeleton';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function SkeletonTable({
  rows = 8,
  cols = 5,
  showHeader = true,
  showFooter = true,
}: SkeletonTableProps) {
  const getWidthClass = (index: number) => {
    const widths = ['w-2/3', 'w-full', 'w-3/4', 'w-1/2', 'w-5/6'];
    return widths[index % widths.length];
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Bar (Search/Filter Area) */}
      {showHeader && (
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-9 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[100px]" />
            <Skeleton className="h-9 w-[80px]" />
          </div>
        </div>
      )}

      {/* Main Table Structure */}
      <div className="border-border bg-card overflow-hidden rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            {/* Table Header */}
            <thead className="bg-muted/30 [&_tr]:border-b">
              <tr className="border-b transition-colors">
                {Array.from({ length: cols }).map((_, i) => (
                  <th
                    key={i}
                    className="h-12 px-4 text-left align-middle font-medium"
                  >
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="[&_tr:last-child]:border-0">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      <Skeleton
                        className={`h-4 ${getWidthClass(colIndex + rowIndex)}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {showFooter && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground flex-1 text-sm">
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
