'use client';

import { useMilestone } from '@/hooks/use-milestone';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { IMilestone } from '@/types/milestone';
import { CreateMilestoneFormSheet } from './create-milestone-form';
import { UpdateMilestoneFormSheet } from './update-milestone-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { createMilestoneColumns } from './milestone-columns';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-header';
import { useDebounce } from '@/lib/use-debounce';

const MilestonePage = () => {
  const router = useRouter();

  const tForm = useTranslations('milestone.milestone-form');
  const tCol = useTranslations('column');
  const tMilestone = useTranslations('milestone');
  const locale = useLocale();

  const {
    allMilestoneFormMap,
    pagination,
    searchQuery,
    // filteredMilestoneIds,
    fetchAllMilestones,
    searchForMilestones,
    // getMilestoneById,
    setSearch: setSearchQuery,
    setPage,
    setPageSize,
    loader,
    storeAction,
    removeMilestone,
    removeMultipleMilestones,
  } = useMilestone();

  const milestoneColumns = React.useMemo(
    () =>
      createMilestoneColumns(locale).map((column) => {
        if (typeof column.header === 'string') {
          return {
            ...column,
            header: tCol(column.header),
          };
        }
        return column;
      }),
    [tCol, locale],
  );

  const [isEdit, setIsEdit] = React.useState<{
    isEditing: boolean;
    milestone?: IMilestone;
  }>({ isEditing: false });

  const [isAdd, setIsAdd] = React.useState(false);

  const [isDelete, setIsDelete] = React.useState<{
    isDeleting: boolean;
    milestoneId?: string[];
  }>({ isDeleting: false });

  // Use local state for pagination to ensure useSWR key changes immediately
  const [currentPage, setCurrentPage] = React.useState(pagination.page);
  const [currentPageSize, setCurrentPageSize] = React.useState(
    pagination.pageSize,
  );

  // Local sorting state for server-side sorting
  const [currentSortBy, setCurrentSortBy] = React.useState<string | undefined>(
    undefined,
  );
  const [currentSortOrder, setCurrentSortOrder] = React.useState<
    'asc' | 'desc' | undefined
  >(undefined);

  const debounceSearchQuery = useDebounce(searchQuery, 500);

  const milestoneFetcher = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ([_key, searchQuery, page, pageSize, sortBy, sortOrder]: [
      string,
      string,
      number,
      number,
      string | undefined,
      'asc' | 'desc' | undefined,
    ]) => {
      try {
        if (searchQuery && searchQuery.trim() !== '') {
          return await searchForMilestones(
            searchQuery,
            page,
            pageSize,
            sortBy,
            sortOrder,
          );
        } else {
          return await fetchAllMilestones(page, pageSize, sortBy, sortOrder);
        }
      } catch (err) {
        toast.error(tForm('toast.fetch_error'));
        throw err;
      }
    },
    [searchForMilestones, fetchAllMilestones, tForm],
  );

  const { mutate } = useSWR(
    [
      'fetch-milestones',
      debounceSearchQuery,
      currentPage,
      currentPageSize,
      currentSortBy,
      currentSortOrder,
    ],
    milestoneFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 1000,
    },
  );

  const onDeleteMilestone = (id: string) => {
    setIsDelete({ isDeleting: true, milestoneId: [id] });
  };

  const onDeleteMultipleMilestones = (milestones: IMilestone[]) => {
    setIsDelete({
      isDeleting: true,
      milestoneId: milestones.map((m) => m.id),
    });
  };

  const onConfirmDelete = async () => {
    if (!isDelete.milestoneId || isDelete.milestoneId.length === 0) return;

    try {
      if (isDelete.milestoneId.length === 1) {
        await removeMilestone(isDelete.milestoneId[0]);
      } else {
        await removeMultipleMilestones(isDelete.milestoneId);
      }
      refreshData();
      toast.success(tForm('toast.deleted-successfully'));
    } catch (error) {
      console.error('Error deleting milestones:', error);
      toast.error(tForm('toast.deletion-failed'));
    } finally {
      setIsDelete({ isDeleting: false, milestoneId: undefined });
    }
  };

  const onSearchChange = React.useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1); // reset local page state
      setPage(1); // sync to Redux
    },
    [setSearchQuery, setPage],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page); // update local state immediately
      setPage(page); // sync to Redux
    },
    [setPage],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize); // update local state immediately
      setCurrentPage(1); // reset to first page
      setPageSize(pageSize); // sync to Redux
    },
    [setPageSize],
  );

  const handleSortChange = React.useCallback(
    (sortBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => {
      setCurrentSortBy(sortBy);
      setCurrentSortOrder(sortOrder);
      setCurrentPage(1);
      setPage(1);
    },
    [setPage],
  );

  // Memoize refresh function
  const refreshData = React.useCallback(() => {
    mutate();
  }, [mutate]);

  const toMilestoneStepPage = (milestoneId: string) => {
    router.push(`/milestone/${milestoneId}`);
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tMilestone('title'), isPage: true }]}
      ></PageHeader>
      <div className="container mx-auto pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{tMilestone('title')}</h1>
          <p className="text-muted-foreground">{tMilestone('sub_title')}</p>
        </div>

        <DataTable
          columns={milestoneColumns}
          data={allMilestoneFormMap}
          onAdd={() => setIsAdd(true)}
          onEdit={(m) => setIsEdit({ isEditing: true, milestone: m })}
          onDelete={onDeleteMilestone}
          onLink={(m) => toMilestoneStepPage(m)}
          onMultiDelete={onDeleteMultipleMilestones}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
          isLoading={loader || storeAction !== 'none'}
          manualPagination={true}
          manualSorting={true}
          onSortChange={handleSortChange}
          page={currentPage}
          pageSize={currentPageSize}
          rowCount={pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        <CreateMilestoneFormSheet
          open={isAdd}
          onOpenChange={() => setIsAdd(false)}
          onSuccess={refreshData}
        />

        <UpdateMilestoneFormSheet
          open={isEdit.isEditing}
          milestone={isEdit.milestone}
          onOpenChange={(open) =>
            setIsEdit((prev) => ({
              ...prev,
              isEditing: open,
            }))
          }
          onSuccess={refreshData}
        />

        <DeleteConfirmationDialog
          open={isDelete.isDeleting}
          onClose={() =>
            setIsDelete({ isDeleting: false, milestoneId: undefined })
          }
          onConfirm={onConfirmDelete}
          isLoading={storeAction === 'deleting'}
          title="header"
          description="confirm"
          translationKey="milestone.delete"
        />
      </div>
    </>
  );
};

export default MilestonePage;
