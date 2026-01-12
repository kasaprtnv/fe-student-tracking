import { AppDispatch } from '@/store';
import { selectStepAttemptsMap } from '@/store/student-step-attempts/student-step-attempts.selectors';
import { getAttemptsByUserId } from '@/store/student-step-attempts/student-step-attempts.thunks';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

export const useAttempt = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const stepAttemptsMap = useSelector(selectStepAttemptsMap);

  // Get attempt by user ID
  const getAttemptByUserId = useCallback(
    (userId: string) => {
      if (stepAttemptsMap[userId]) return stepAttemptsMap[userId];
      return dispatch(getAttemptsByUserId(userId)).unwrap();
    },
    [dispatch, stepAttemptsMap],
  );

  return {
    stepAttemptsMap,
    getAttemptByUserId,
  };
};
