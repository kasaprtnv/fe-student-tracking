'use client';

import { useMilestone } from '@/hooks/use-milestone';
import { useTranslations } from 'next-intl';
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

const MilestonePage = () => {
  const router = useRouter();

  const tForm = useTranslations('milestone.milestone-form');
  const tCol = useTranslations('column');
  const tMilestone = useTranslations('milestone');

  const {
    filteredMilestoneIds,
    searchQuery,
    fetchAllMilestones,
    getMilestoneById,
    setSearch: setSearchQuery,
    removeMilestone,
    removeMultipleMilestones,
    updateExistingMilestone,
  } = useMilestone();

  const milestoneColumns = createMilestoneColumns().map((column) => {
    if (typeof column.header === 'string') {
      return {
        ...column,
        header: tCol(column.header),
      };
    }
    return column;
  });

  const [isEdit, setIsEdit] = React.useState<{
    isEditing: boolean;
    milestone?: IMilestone;
  }>({ isEditing: false });

  const [isAdd, setIsAdd] = React.useState(false);

  const [isDelete, setIsDelete] = React.useState<{
    isDeleting: boolean;
    milestoneId?: string[];
  }>({ isDeleting: false });

  useSWR(
    'fetch-milestones',
    async () => {
      await fetchAllMilestones();
    },
    { revalidateOnFocus: false },
  );

  const filteredMilestoneData = filteredMilestoneIds
    .map((id) => getMilestoneById(id))
    .filter((m) => m !== undefined) as IMilestone[];

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
      toast.success(tForm('toast.deleted-successfully'));
    } catch (error) {
      console.error('Error deleting milestones:', error);
      toast.error(tForm('toast.deletion-failed'));
    } finally {
      setIsDelete({ isDeleting: false, milestoneId: undefined });
    }
  };

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const toMilestoneStepPage = (milestoneId: string) => {
    router.push(`/milestone/${milestoneId}`);
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tMilestone('title'), isPage: true }]}
      ></PageHeader>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{tMilestone('title')}</h1>
          <p className="text-muted-foreground">{tMilestone('sub_title')}</p>
        </div>

        <DataTable
          columns={milestoneColumns}
          data={filteredMilestoneData}
          onAdd={() => setIsAdd(true)}
          onEdit={(m) => setIsEdit({ isEditing: true, milestone: m })}
          onDelete={onDeleteMilestone}
          onLink={(m) => toMilestoneStepPage(m)}
          onMultiDelete={onDeleteMultipleMilestones}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
        />

        <CreateMilestoneFormSheet
          open={isAdd}
          onOpenChange={() => setIsAdd(false)}
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
        />

        <DeleteConfirmationDialog
          open={isDelete.isDeleting}
          onClose={() =>
            setIsDelete({ isDeleting: false, milestoneId: undefined })
          }
          onConfirm={onConfirmDelete}
          isLoading={false}
          title="header"
          description="confirm"
          translationKey="milestone.delete"
        />
      </div>
    </>
  );
};

export default MilestonePage;
