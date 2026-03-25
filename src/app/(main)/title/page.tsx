'use client';

import { useTitle } from '@/hooks/use-title';
import { useTranslations, useLocale } from 'next-intl';
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
  const locale = useLocale();

  const {
    filteredTitlesId,
    searchQuery,
    fetchAllTitlesWithUsage,
    getTitleById,
    setSearch: setSearchQuery,
    removeTitle,
    checkTitleInUse,
  } = useTitle();

  const titleColumns = createTitleColumns(locale).map((column) => {
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
    titleIds?: string[];
  }>({
    isDeleting: false,
  });
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);

  useSWR(
    'fetch-titles',
    async () => {
      await fetchAllTitlesWithUsage();
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

  const onDeleteTitle = async (id: string) => {
    try {
      const isInUse = await checkTitleInUse(id);
      if (isInUse) {
        toast.error(tForm('toast.cannot-delete-in-use'));
        return;
      }
      setIsDelete({ isDeleting: true, titleIds: [id] });
    } catch {
      toast.error(tForm('toast.delete-error'));
    }
  };

  const onDeleteMultipleTitles = (titles: ITitle[]) => {
    setIsDelete({
      isDeleting: true,
      titleIds: titles.map((title) => title.id),
    });
  };

  const onConfirmDelete = async () => {
    if (!isDelete.titleIds || isDelete.titleIds.length === 0) return;
    setIsDeleteLoading(true);
    try {
      const inUseIds: string[] = [];
      const deletableIds: string[] = [];

      await Promise.all(
        isDelete.titleIds.map(async (id) => {
          const isInUse = await checkTitleInUse(id);
          if (isInUse) {
            inUseIds.push(id);
          } else {
            deletableIds.push(id);
          }
        }),
      );

      if (inUseIds.length > 0) {
        toast.error(tForm('toast.cannot-delete-in-use'));
      }

      for (const id of deletableIds) {
        await removeTitle(id);
      }

      if (deletableIds.length > 0) {
        toast.success(tForm('toast.deleted-successfully'));
      }
    } catch {
      toast.error(tForm('toast.deletion-failed'));
    } finally {
      setIsDeleteLoading(false);
      setIsDelete({ isDeleting: false, titleIds: undefined });
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
      <div className="container mx-auto pt-2 pb-8">
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
          onMultiDelete={onDeleteMultipleTitles}
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
            setIsEdit({ isEditing: false, title: undefined });
          }}
        />
        <DeleteConfirmationDialog
          open={isDelete.isDeleting}
          onClose={() =>
            setIsDelete({ isDeleting: false, titleIds: undefined })
          }
          onConfirm={onConfirmDelete}
          isLoading={isDeleteLoading}
          title="header"
          description="confirm"
          translationKey="title.delete"
          count={isDelete.titleIds?.length}
        />
      </div>
    </>
  );
};

export default TitlePage;
