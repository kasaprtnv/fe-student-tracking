import useSWR from 'swr';
import { studentStepProgressService } from '@/services/student-step-progress.service';

export const usePendingCount = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'pending-count',
    async () => {
      const response = await studentStepProgressService.getAllPending();
      return response?.data?.length || 0;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    },
  );

  return {
    pendingCount: data || 0,
    isLoading,
    error,
    refresh: mutate,
  };
};
