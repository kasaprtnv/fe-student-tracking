import { headers } from 'next/headers';

export async function fetchMilestonesWithStatus(
  courseId: string,
  userId: string,
) {
  const headerStore = await headers();
  const cookie = headerStore.get('cookie');

  if (!cookie) {
    throw new Error('No session cookie');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/milestones/course/${courseId}/user/${userId}`,
    {
      method: 'GET',
      headers: {
        cookie,
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch milestones: ${res.status}`);
  }

  const result = await res.json();
  return result.data;
}
