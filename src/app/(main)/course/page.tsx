'use client';

import { useCourse } from '@/hooks/use-course';
import { useTranslations } from 'next-intl';
import { createCourseColumns } from './course-column';
import React from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { ICourse } from '@/types/course';
import { CreateCourseFormSheet } from './create-course-form';
import { UpdateCourseFormSheet } from './update-course-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { DataTableFilterField } from '@/components/data-table/types';

const CoursePage = () => {
  const tForm = useTranslations('course.course-form');
  const tCol = useTranslations('column');
  const tCourse = useTranslations('course');
  const {
    filteredCoursesId,
    searchQuery,
    fetchAllCourses,
    getCourseById,
    setSearchQuery,
    removeCourse,
    removeMultipleCourses,
    updateExistingCourse,
  } = useCourse();

  const courseColumns = createCourseColumns().map((column) => {
    if (typeof column.header === 'string') {
      return {
        ...column,
        header: tCol(column.header),
      };
    }
    return column;
  });

  const filterColumns: DataTableFilterField<ICourse>[] = [
    {
      id: 'name',
      label: tCol('name'),
      options: filteredCoursesId
        ?.map((id) => {
          const course = getCourseById(id);
          if (course) {
            return {
              label: course.name,
              value: course.name,
            };
          }
          return undefined;
        })
        .filter((item) => item !== undefined),
    },
    {
      id: 'isActive',
      label: tCol('is_active'),
      options: Array.from(
        new Set(
          filteredCoursesId?.map((id) => {
            const course = getCourseById(id);
            if (course) {
              return {
                label: course.isActive ? tCol('active') : tCol('inactive'),
                value: course.isActive,
              };
            }
            return undefined;
          }),
        ),
      ).filter((item) => item !== undefined),
    },
  ];

  console.log('Filter Columns:', filterColumns);

  const [isEdit, setIsEdit] = React.useState<{
    isEditing: boolean;
    course?: ICourse;
  }>({
    isEditing: false,
  });
  const [isAdd, setIsAdd] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState<{
    isDeleting: boolean;
    courseId?: string[];
  }>({
    isDeleting: false,
  });

  useSWR(
    'fetch-courses',
    async () => {
      await fetchAllCourses();
    },
    {
      revalidateOnFocus: false,
    },
  );

  const filterCourseData = filteredCoursesId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return;
      return course;
    })
    .filter((course) => course !== undefined);

  const onDeleteCourse = (id: string) => {
    setIsDelete({ isDeleting: true, courseId: [id] });
  };

  const onDeleteMultipleCourses = (courses: ICourse[]) => {
    setIsDelete({
      isDeleting: true,
      courseId: courses.map((course) => course.id),
    });
  };

  const onConfirmDelete = async () => {
    if (!isDelete.courseId || isDelete?.courseId.length == 0) return;
    console.log('Deleting courses with IDs:', isDelete.courseId);
    try {
      if (isDelete.courseId.length === 1) {
        await removeCourse(isDelete.courseId[0]);
      } else {
        await removeMultipleCourses(isDelete.courseId);
      }
      toast.success(tForm('toast.deleted-successfully'));
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast.error(tForm('toast.deletion-failed'));
    } finally {
      setIsDelete({ isDeleting: false, courseId: undefined });
    }
  };

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const onIsActiveChange = async (id: string, isActive: boolean) => {
    try {
      await updateExistingCourse(id, { isActive });
    } catch (error) {
      console.error('Error updating course active status:', error);
      toast.error(tForm('toast.update-failed'));
    }
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{tCourse('title')}</h1>
          <p className="text-muted-foreground">{tCourse('sub_title')}</p>
        </div>
        <DataTable
          columns={courseColumns}
          data={filterCourseData ?? []}
          onAdd={() => setIsAdd(true)}
          onEdit={(course) => setIsEdit({ isEditing: true, course: course })}
          onDelete={onDeleteCourse}
          onMultiDelete={onDeleteMultipleCourses}
          onActiveChange={onIsActiveChange}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
          filterColumns={filterColumns}
        />
        <CreateCourseFormSheet
          open={isAdd}
          onOpenChange={() => {
            setIsAdd(false);
          }}
        />
        <UpdateCourseFormSheet
          open={isEdit.isEditing && isEdit.course !== undefined}
          course={isEdit.course}
          onOpenChange={() => {
            setIsEdit({ isEditing: false });
          }}
        />
        <DeleteConfirmationDialog
          open={isDelete.isDeleting}
          onClose={() =>
            setIsDelete({ isDeleting: false, courseId: undefined })
          }
          onConfirm={onConfirmDelete}
          isLoading={false} // หรือใช้ state เช่น storeAction === 'deleting'
          title="header"
          description="confirm"
          translationKey="course.delete"
        />
      </div>
    </>
  );
};

export default CoursePage;
