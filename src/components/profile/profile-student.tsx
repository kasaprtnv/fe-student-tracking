import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '@/types/user';
import { UploadProfileDialog } from './upload-profile-dialog';
import {
  CalendarDays,
  GraduationCap,
  IdCardIcon,
  Landmark,
  LucideIdCardLanyard,
  Mail,
  Phone,
  User2,
} from 'lucide-react';
import { Separator } from '../ui/separator';

interface ProfileStudentPageProps {
  user: User | null;
  isLoading?: boolean;
  isOwnProfile?: boolean;
}

export const ProfileStudentComponent: React.FC<ProfileStudentPageProps> = ({
  user,
  isLoading,
  isOwnProfile,
}) => {
  const t = useTranslations('profile');
  const tStudent = useTranslations('student-page');
  const role = user?.role === 'student' ? 'student' : user?.role;
  const API_STATIC_URL =
    process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:3001/static';

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 text-2xl font-bold">
          {t('personal_information.title')}
        </div>
        <div className="flex flex-row items-center gap-8">
          {/* Skeleton for Avatar */}
          <div className="h-60 w-60 animate-pulse rounded-full bg-gray-200" />

          {/* Skeleton for Info */}
          <div className="flex-1 space-y-4">
            <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <Separator className="my-6" />
      </div>
    );
  }
  return (
    <div>
      <div className="mb-4 text-2xl font-bold">
        {isOwnProfile
          ? t('personal_information.title')
          : tStudent('personal-information-student')}
      </div>
      <div className="flex flex-row items-center gap-8">
        {/* Profile Image */}
        <div className="relative">
          <Avatar className="h-60 w-60 bg-white">
            <AvatarImage
              src={`${API_STATIC_URL}${user?.profileImageUrl ?? ''}`}
            />
            <AvatarFallback>{`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <div className="absolute right-4 bottom-4">
              <UploadProfileDialog
                userId={user?.id}
                firstName={user?.firstName}
                lastName={user?.lastName}
              />
            </div>
          )}
        </div>
        {/* Information */}
        <div className="flex-1">
          <div className="grid gap-x-2 gap-y-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {role === 'student' && (
              <div className="flex flex-col gap-1">
                <span className="mr-2 text-base font-medium text-gray-600">
                  {t('personal_information.student_id')}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-center">
                    <IdCardIcon className="size-6 text-red-800" />
                  </span>
                  <span className="text-xl">{user?.code ?? '-'}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.name')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <User2 className="size-6 text-red-800" />
                </span>
                <span
                  className="block truncate text-xl"
                  title={`${user?.firstName} ${user?.lastName}`}
                >
                  {`${user?.firstName} ${user?.lastName}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.major')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <Landmark className="size-5 text-red-800" />
                </span>
                <span className="text-xl">{user?.major ?? '-'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.faculty')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <LucideIdCardLanyard className="size-6 text-red-800" />
                </span>
                <span className="text-xl">
                  {t('personal_information.polsci-law')}
                </span>
              </div>
            </div>
            {role === 'student' && (
              <div className="flex flex-col gap-1">
                <span className="mr-2 text-base font-medium text-gray-600">
                  {t('personal_information.year')}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-center">
                    <CalendarDays className="size-5 text-red-800" />
                  </span>
                  <span className="text-xl">{user?.year ?? '-'}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.course')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <GraduationCap className="size-6 text-red-800" />
                </span>
                <span
                  className="block truncate text-xl"
                  title={user?.courseName ?? '-'}
                >
                  {user?.courseName ?? '-'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.email')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <Mail className="size-5 text-red-800" />
                </span>
                <span
                  className="block truncate text-xl"
                  title={user?.email ?? '-'}
                >
                  {user?.email ?? '-'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.phone')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <Phone className="size-5 text-red-800" />
                </span>
                <span className="text-xl">{user?.phone ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
