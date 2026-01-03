'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { studentStepProgressService } from '@/services/student-step-progress.service';
import { IStudentStepProgress } from '@/types/student-step-progress';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';

export default function VerifyCertificatePage() {
  const t = useTranslations('verify-certificate');
  const router = useRouter();
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, initialized, router]);

  const [data, setData] = useState<IStudentStepProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // เมื่อเลือก "ทั้งหมด" ให้ดึงข้อมูลทุก status ที่เกี่ยวข้องกับการตรวจสอบ
      if (statusFilter === 'all') {
        const [pendingRes, approvedRes, declinedRes] = await Promise.all([
          studentStepProgressService.getAll({ status: 'pending approval' }),
          studentStepProgressService.getAll({ status: 'approved' }),
          studentStepProgressService.getAll({ status: 'declined' }),
        ]);
        const allData = [
          ...(pendingRes.data || []),
          ...(approvedRes.data || []),
          ...(declinedRes.data || []),
        ];
        console.log('All Data:', allData);
        setData(allData);
      } else {
        const response = await studentStepProgressService.getAll({
          status: statusFilter,
        });
        console.log('API Response:', response);
        console.log('Data:', response.data);
        if (response.data && response.data.length > 0) {
          console.log(
            'First item structure:',
            JSON.stringify(response.data[0], null, 2),
          );
        }
        setData(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by search query and date range
  const filteredData = data.filter((item) => {
    const studentCode = item.studentCode || item.student?.code || '';
    const studentName =
      item.studentName ||
      `${item.student?.firstName || ''} ${item.student?.lastName || ''}`;
    const stepName = item.stepName || item.step?.name || '';

    // Search filter
    const matchesSearch =
      studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stepName.toLowerCase().includes(searchQuery.toLowerCase());

    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const submitDate = item.submittedAt ? new Date(item.submittedAt) : null;
      if (submitDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (submitDate < start) matchesDateRange = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (submitDate > end) matchesDateRange = false;
        }
      } else {
        matchesDateRange = false;
      }
    }

    // กรองสถานะ
    if (statusFilter === 'all') {
      return matchesSearch && matchesDateRange;
    } else {
      return matchesSearch && matchesDateRange && item.status === statusFilter;
    }
  });

  // เรียงตามวันที่ส่ง (ใหม่สุดก่อน)
  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending approval':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {t('status.pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {t('status.approved')}
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {t('status.declined')}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageHeader
        breadcrumbs={[{ label: t('breadcrumb.verify'), isPage: true }]}
      />

      {/* Title */}
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('filter.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all_status')}</SelectItem>
              <SelectItem value="pending approval">
                {t('status.pending')}
              </SelectItem>
              <SelectItem value="approved">{t('status.approved')}</SelectItem>
              <SelectItem value="declined">{t('status.declined')}</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !startDate && !endDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && endDate ? (
                  <>
                    {format(startDate, 'dd MMM yyyy', { locale: th })} -{' '}
                    {format(endDate, 'dd MMM yyyy', { locale: th })}
                  </>
                ) : startDate ? (
                  <>{format(startDate, 'dd MMM yyyy', { locale: th })} - ...</>
                ) : endDate ? (
                  <>... - {format(endDate, 'dd MMM yyyy', { locale: th })}</>
                ) : (
                  <span>{t('filter.select_date_range')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <div className="border-r p-2">
                  <p className="mb-2 text-center text-sm font-medium">
                    {t('filter.start_date')}
                  </p>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </div>
                <div className="p-2">
                  <p className="mb-2 text-center text-sm font-medium">
                    {t('filter.end_date')}
                  </p>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                  >
                    {t('filter.clear')}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.student_code')}</TableHead>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.course')}</TableHead>
              <TableHead>{t('table.step')}</TableHead>
              <TableHead>{t('table.submit_date')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-center">{t('table.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  {t('no_data')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.studentCode || item.student?.code || '-'}
                  </TableCell>
                  <TableCell>
                    {item.studentName ||
                      `${item.student?.firstName || ''} ${item.student?.lastName || ''}`.trim() ||
                      '-'}
                  </TableCell>
                  <TableCell>
                    {item.courseName || item.student?.courseName || '-'}
                  </TableCell>
                  <TableCell>
                    {item.stepName || item.step?.name || '-'}
                  </TableCell>
                  <TableCell>{formatDate(item.submittedAt)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/verifycertificate/${item.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {t('pagination.showing', {
            start: startIndex + 1,
            end: Math.min(endIndex, filteredData.length),
            total: filteredData.length,
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{t('pagination.rows_per_page')}</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">
            {t('pagination.page', {
              current: currentPage,
              total: totalPages || 1,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="-ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="-ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
