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
