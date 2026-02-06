import { headers } from 'next/headers';
import { UserProfile } from '@/types/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function fetchProfileData(userId: string): Promise<UserProfile> {
  const headerStore = await headers();
  const cookie = headerStore.get('cookie');

  if (!cookie) {
    throw new Error('No session cookie found');
  }

  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      cookie,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`);
  }

  const result = await res.json();

  return {
    ...result.data,
    milestones: result.data.milestones ?? [],
  };
}
