'use client';

import PageLayout from '../page';
import { useParams } from 'next/navigation';

export default function SelectedMilestoneByIdPage() {
  const params = useParams<{ 'selected-milestoneId': string }>();
  const courseId = params['selected-milestoneId'];

  return <PageLayout courseId={courseId} />;
}
