import * as XLSX from 'xlsx';

/**
 * Export data to Excel file.
 * @param data Array of objects (rows)
 * @param columns Array of columns (with header and accessorKey)
 * @param fileName Name of the exported file (default: "export.xlsx")
 */
export function exportToExcel<T>(
  data: T[],
  columns: { header: string; accessorKey: string }[],
  fileName = 'export.xlsx',
) {
  // Map data to array of objects with only selected columns
  const exportData = data.map((row) => {
    const obj: Record<string, T[keyof T]> = {};
    columns.forEach((col) => {
      obj[col.header] = row[col.accessorKey as keyof T];
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // สร้างไฟล์ Excel เป็น binary แล้วดาวน์โหลด (Browser safe)
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
