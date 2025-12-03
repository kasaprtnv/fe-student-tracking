'use client';

import { useCourse } from '@/hooks/use-course';
import { useTranslations } from 'next-intl';
import { createCourseColumns } from './course-column';
import React from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { ICourse } from '@/types/course';
import { CreateCourseFormDialog } from './create-course-form';
import { UpdateCourseFormDialog } from './update-course-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { useCourseStaff } from '@/hooks/use-course_staff';
// import { DataTableFilterField } from '@/components/data-table/types';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-header';
import { useUser } from '@/hooks/use-user';
import { SelectOption } from '@/types';

const CoursePage = () => {
  const tForm = useTranslations('course.course-form');
  const tCol = useTranslations('column');
  const tCourse = useTranslations('course');
  const router = useRouter();
  const {
    filteredCoursesId,
    searchQuery,
    fetchAllCourses,
    getCourseById,
    setSearch: setSearchQuery,
    removeCourse,
    removeMultipleCourses,
  } = useCourse();
  const { fetchAllCourseStaff } = useCourseStaff();
  const { fetchTeachers, allUserIds, getUserById } = useUser();

  const courseColumns = createCourseColumns().map((column) => {
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
    'fetch-courses and-course-staff',
    async () => {
      await fetchAllCourses();
      await fetchAllCourseStaff();
      await fetchTeachers();
    },
    {
      revalidateOnFocus: false,
    },
  );

  const filterCourseData = filteredCoursesId
    .map((id) => {
      const course = getCourseById(id);
      if (!course) return;

      if (course.staffIds && course.staffIds.length > 0) {
        const users = course.staffIds
          .map((userId) => getUserById(userId))
          .filter((user) => user !== undefined);
        return { ...course, users };
      }

      return course;
    })
    .filter((course) => course !== undefined);

  const teacherOptions: SelectOption[] = allUserIds
    .map((id) => {
      const user = getUserById(id);
      if (!user || user.role !== 'teacher') return undefined;
      return { label: `${user.firstName} ${user.lastName}`, value: user.id };
    })
    .filter((option) => option !== undefined);

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

  // const filterColumns: DataTableFilterField<ICourse>[] = [
  //   {
  //     id: 'isActive',
  //     label: 'Status',
  //     options: filteredCoursesId
  //       .map((id) => {
  //         const course = getCourseById(id);
  //         if (!course) return undefined;
  //         return {
  //           label: course.isActive ? tCol('active') : tCol('inactive'),
  //           value: course.isActive,
  //         };
  //       })
  //       .filter((option) => option !== undefined),
  //   },
  // ];

  const toSelectMilestonePage = (milestoneId: string) => {
    router.push(`/selected-milestone/${milestoneId}`);
  };

  return (
    <>
      <PageHeader breadcrumbs={[{ label: tCourse('title'), isPage: true }]} />
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
          onLink={(m) => toSelectMilestonePage(m)}
          onMultiDelete={onDeleteMultipleCourses}
          // filterColumns={filterColumns}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
        />
        <CreateCourseFormDialog
          open={isAdd}
          onOpenChange={() => {
            setIsAdd(false);
          }}
          teacherOptions={teacherOptions}
        />
        <UpdateCourseFormDialog
          open={isEdit.isEditing && isEdit.course !== undefined}
          course={isEdit.course}
          onOpenChange={() => {
            setIsEdit({ isEditing: false });
          }}
          // teacherOptions={teacherOptions}
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
          count={isDelete.courseId?.length}
        />
      </div>
    </>
  );
};

export default CoursePage;
