'use client';

import { useTitle } from '@/hooks/use-title';
import { useTranslations } from 'next-intl';
import { createTitleColumns } from './title-column';
import React from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { ITitle } from '@/types/title';
import { CreateTitleFormDialog } from './create-title-form';
import { UpdateTitleFormDialog } from './update-title-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { PageHeader } from '../../../components/page-header';

const TitlePage = () => {
  const tForm = useTranslations('title.title-form');
  const tCol = useTranslations('column');
  const tTitle = useTranslations('title');

  const {
    filteredTitlesId,
    searchQuery,
    fetchAllTitles,
    getTitleById,
    setSearch: setSearchQuery,
    removeTitle,
  } = useTitle();

  const titleColumns = createTitleColumns().map((column) => {
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
    title?: ITitle;
  }>({
    isEditing: false,
  });
  const [isAdd, setIsAdd] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState<{
    isDeleting: boolean;
    titleId?: string;
  }>({
    isDeleting: false,
  });

  useSWR(
    'fetch-titles',
    async () => {
      await fetchAllTitles();
    },
    {
      revalidateOnFocus: false,
    },
  );

  const filterTitleData = filteredTitlesId
    .map((id) => {
      const title = getTitleById(id);
      if (!title) return;
      return title;
    })
    .filter((title) => title !== undefined);

  const onDeleteTitle = (id: string) => {
    setIsDelete({ isDeleting: true, titleId: id });
  };

  const onConfirmDelete = async () => {
    if (!isDelete.titleId) return;
    try {
      await removeTitle(isDelete.titleId);
      toast.success(tForm('toast.deleted-successfully'));
    } catch (error) {
      console.error('Error deleting title:', error);
      toast.error(tForm('toast.deletion-failed'));
    } finally {
      setIsDelete({ isDeleting: false, titleId: undefined });
    }
  };

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tTitle('page-title'), isPage: true }]}
      />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{tTitle('page-title')}</h1>
          <p className="text-muted-foreground">{tTitle('sub_title')}</p>
        </div>
        <DataTable
          columns={titleColumns}
          data={filterTitleData ?? []}
          onAdd={() => setIsAdd(true)}
          onEdit={(title) => setIsEdit({ isEditing: true, title })}
          onDelete={onDeleteTitle}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
        />
        <CreateTitleFormDialog
          open={isAdd}
          onOpenChange={() => {
            setIsAdd(false);
          }}
        />
        <UpdateTitleFormDialog
          open={isEdit.isEditing && isEdit.title !== undefined}
          title={isEdit.title}
          onOpenChange={() => {
            setIsEdit({ isEditing: false });
          }}
        />
        <DeleteConfirmationDialog
          open={isDelete.isDeleting}
          onClose={() => setIsDelete({ isDeleting: false, titleId: undefined })}
          onConfirm={onConfirmDelete}
          isLoading={false}
          title="header"
          description="confirm"
          translationKey="title.delete"
          count={1}
        />
      </div>
    </>
  );
};

export default TitlePage;
