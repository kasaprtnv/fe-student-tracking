'use client';

import ExcelJS from 'exceljs';
import { IStepProgressReport } from '@/types/step-progress-report';
import { formatShortDate } from '@/lib/format-date';

interface ExportOptions {
  tColumn: (key: string) => string;
  tStatus: (key: string) => string;
  tDegree: (key: string) => string;
  locale: string;
  filters?: { label: string; value: string }[];
  filterTitle?: string;
}

const getStatusStyle = (status: IStepProgressReport['status']) => {
  switch (status) {
    case 'locked':
      return { bg: 'D1D5DB', text: '1F2937' };
    case 'pending_approval':
      return { bg: 'FDE68A', text: '92400E' };
    case 'declined':
      return { bg: 'FCA5A5', text: '7F1D1D' };
    case 'approved':
      return { bg: '86EFAC', text: '065F46' };
    case 'available':
      return { bg: '93C5FD', text: '1E3A8A' };
    default:
      return { bg: 'FFFFFF', text: '000000' };
  }
};

export const exportToExcel = async (
  data: IStepProgressReport[],
  options: ExportOptions,
  fileName: string,
) => {
  const { tColumn, tStatus, tDegree, locale, filters, filterTitle } = options;
  if (!data.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  /* ================= FILTER INFO ================= */
  let dataStartRow = 1;

  if (filters && filters.length > 0) {
    // Title row
    const titleRow = worksheet.addRow([filterTitle ?? 'Applied Filters']);
    titleRow.font = {
      bold: true,
      name: 'TH Sarabun New',
      size: 18,
      color: { argb: '1E3A8A' },
    };
    worksheet.mergeCells(1, 1, 1, 2);

    const titleCell = titleRow.getCell(1);
    titleCell.alignment = { horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' },
    };
    titleCell.font = {
      color: { argb: 'FFFFFF' },
      bold: true,
      name: 'TH Sarabun New',
      size: 18,
    };

    // Filter rows
    filters.forEach((filter) => {
      const filterRow = worksheet.addRow([filter.label, filter.value]);
      filterRow.getCell(1).font = {
        bold: true,
        name: 'TH Sarabun New',
        size: 16,
      };
      filterRow.getCell(2).font = {
        name: 'TH Sarabun New',
        size: 16,
      };
    });

    // Empty row separator
    worksheet.addRow([]);

    dataStartRow = filters.length + 3; // title + filters + empty row
  }

  /* ================= HEADER ================= */
  worksheet.addRow([
    tColumn('student-code'),
    tColumn('full-name'),
    tColumn('major'),
    tColumn('degree'),
    tColumn('year'),
    tColumn('course-name'),
    tColumn('milestone-name'),
    tColumn('step-name'),
    tColumn('status'),
    tColumn('due-date'),
  ]);

  const headerRow = worksheet.getRow(dataStartRow);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' },
      name: 'TH Sarabun New',
      size: 18,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' },
    };
  });

  /* ================= DATA ================= */
  data.forEach((row) => {
    const excelRow = worksheet.addRow([
      row.studentCode,
      `${row.studentFirstName} ${row.studentLastName}`.trim() || '-',
      row.studentMajor || '-',
      tDegree(row.studentDegree) || '-',
      row.studentYear || '-',
      row.courseName,
      row.milestoneName,
      row.stepName,
      tStatus(row.status),
      row.dueDate ? formatShortDate(row.dueDate, locale) : '-',
    ]);

    excelRow.font = {
      name: 'TH Sarabun New',
      size: 16,
    };

    // STATUS CELL STYLE
    const statusCell = excelRow.getCell(9);
    const style = getStatusStyle(row.status);

    statusCell.alignment = { horizontal: 'center' };
    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: style.bg },
    };
    statusCell.font = {
      color: { argb: style.text },
      bold: true,
    };
  });

  /* ================= COLUMN WIDTH ================= */
  worksheet.columns.forEach((column) => {
    column.width = 22;
  });

  /* ================= FREEZE HEADER ================= */
  worksheet.views = [{ state: 'frozen', ySplit: dataStartRow }];

  /* ================= EXPORT ================= */
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  window.URL.revokeObjectURL(url);
};
