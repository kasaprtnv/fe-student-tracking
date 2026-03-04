import useSWR from 'swr';
import { studentStepProgressService } from '@/services/student-step-progress.service';
import { courseStaffService } from '@/services/course-staff.service';
import { courseService } from '@/services/course.service';
import { useAuth } from '@/hooks/use-auth';

export const usePendingCount = () => {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    user ? ['pending-count', user.id, user.role] : null,
    async () => {
      const response = await studentStepProgressService.getAllPending();
      const allPending = response?.data || [];

      // Admin sees all pending items
      if (user?.role === 'admin') {
        return allPending.length;
      }

      // Teacher sees only items from students in their managed courses
      if (user?.role === 'teacher' && user?.id) {
        try {
          const courseStaffResponse =
            await courseStaffService.getCourseStaffByUserId(user.id);
          const managedCourseIds = (courseStaffResponse.data || []).map(
            (cs) => cs.courseId,
          );

          // If teacher doesn't manage any course, return 0
          if (managedCourseIds.length === 0) {
            return 0;
          }

          // ดึง all courses แล้ว filter เฉพาะที่ดูแล
          const allCoursesRes = await courseService.getAllCourses();
          const allCourses = allCoursesRes.data || [];
          const managedCourseCodes = allCourses
            .filter((c) => managedCourseIds.includes(c.id))
            .map((c) => c.code);

          // Filter pending items by courseCode (flat field)
          const filteredPending = allPending.filter((item) => {
            const studentCourseId = item.student?.courseId;
            const studentCourseCode =
              item.courseCode || item.student?.courseCode || '';

            const matchById =
              studentCourseId && managedCourseIds.includes(studentCourseId);
            const matchByCode =
              studentCourseCode &&
              managedCourseCodes.includes(studentCourseCode);

            return matchById || matchByCode;
          });

          return filteredPending.length;
        } catch (error) {
          console.error('Error fetching managed courses:', error);
          return 0;
        }
      }

      return 0;
    },
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    pendingCount: data || 0,
    isLoading,
    error,
    refresh: mutate,
  };
};
