import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '@/types/user';
import { UploadProfileDialog } from './upload-profile-dialog';
import {
  GraduationCap,
  Landmark,
  LucideIdCardLanyard,
  Mail,
  Medal,
  Phone,
  ScrollText,
} from 'lucide-react';
import { Separator } from '../ui/separator';

interface ProfileTeacherPageProps {
  user: User | null;
  isLoading?: boolean;
}

export const ProfileTeacherComponent: React.FC<ProfileTeacherPageProps> = ({
  user,
  isLoading,
}) => {
  const t = useTranslations('profile');
  const API_STATIC_URL =
    process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:3001/static';

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 text-2xl font-bold">
          {t('personal_information.title')}
        </div>
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="h-60 w-60 animate-pulse rounded-full bg-gray-200" />
          <div className="w-1/2 space-y-4">
            <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <Separator className="my-6" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-2xl font-bold">
        {t('personal_information.title')}
      </div>
      <div className="flex flex-col items-center justify-center">
        {/* Profile Image + Name + Position */}
        <div className="relative mb-6 flex flex-col items-center justify-center">
          <div className="relative">
            <Avatar className="h-60 w-60 border-4 border-white bg-white">
              <AvatarImage
                src={
                  user?.profileImageUrl
                    ? `${API_STATIC_URL}${user.profileImageUrl}`
                    : '/profile.png'
                }
              />
              <AvatarFallback className="text-4xl">{`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`}</AvatarFallback>
            </Avatar>
            <div className="absolute right-4 bottom-4">
              <UploadProfileDialog
                userId={user?.id}
                firstName={user?.firstName}
                lastName={user?.lastName}
              />
            </div>
          </div>
          <div className="mt-4 text-center text-2xl font-bold">{`${user?.titleName || ''}${user?.firstName} ${user?.lastName}`}</div>
          <div className="text-center text-lg font-medium text-red-700">
            {t('personal_information.teacher_position')}
          </div>
        </div>
        <Separator className="mb-8" />

        {/* ข้อมูลส่วนตัว */}
        <div className="mb-6 w-11/12">
          <div className="rounded-3xl border bg-white px-14 py-6">
            {/* Header */}
            <div className="mb-6 border-l-4 border-red-600 pl-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('personal_information.personal_information_title')}
              </h2>
            </div>
            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-6">
              {/* สาขา */}
              <div className="col-span-5 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <Landmark className="size-5 text-red-800" />
                  {t('personal_information.major')}
                </label>
                <span className="rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg">
                  {user?.major ? user.major : '-'}
                </span>
              </div>

              {/* คณะ */}
              <div className="col-span-5 col-start-8 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <LucideIdCardLanyard className="size-6 text-red-800" />
                  {t('personal_information.faculty')}
                </label>
                <span className="rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg">
                  {t('personal_information.polsci-law')}
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-6 grid grid-cols-12 gap-6">
              {/* คอร์สที่ดูแล */}
              <div className="col-span-5 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <GraduationCap className="size-5 text-red-800" />
                  {t('personal_information.responsibility_course')}
                </label>
                <span className="rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg">
                  {user?.managedCourses && user.managedCourses.length > 0
                    ? user.managedCourses.map((c) => c.name).join(', ')
                    : '-'}
                </span>
              </div>

              {/* ตำแหน่งวิชาการ */}
              <div className="col-span-5 col-start-8 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <Medal className="size-6 text-red-800" />
                  {t('personal_information.academic_position')}
                </label>
                <span className="rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg">
                  {user?.academicPosition
                    ? user.academicPosition
                        .split(',')
                        .map((pos) => pos.trim())
                        .join(', ')
                    : '-'}
                </span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="mt-6 grid grid-cols-12 gap-6">
              {/* วุฒิการศึกษา */}
              <div className="col-span-5 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <ScrollText className="size-6 text-red-800" />
                  {t('personal_information.degree')}
                </label>
                <span className="rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg">
                  {user?.teacherDegree ? user.teacherDegree : '-'}
                </span>
              </div>

              {/* อีเมล */}
              <div className="col-span-5 col-start-8 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <Mail className="size-6 text-red-800" />
                  {t('personal_information.email')}
                </label>
                <span
                  className="block truncate rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg"
                  title={user?.email ?? '-'}
                >
                  {user?.email ? user.email : '-'}
                </span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="mt-6 grid grid-cols-12 gap-6">
              {/* วุฒิการศึกษา */}
              <div className="col-span-5 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <Phone className="size-5 text-red-800" />
                  {t('personal_information.phone')}
                </label>
                <span className="rounded-lg border border-gray-200 bg-red-50 px-4 py-2 text-lg">
                  {user?.phone ? user.phone : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
