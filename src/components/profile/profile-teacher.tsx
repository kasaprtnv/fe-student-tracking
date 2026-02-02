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
  const tDegree = useTranslations('degree');
  const API_STATIC_URL =
    process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:3001/static';

  const mappedDegree = (degree: string) => {
    if (!degree) return '-';
    const degreeMap: Record<string, string> = {
      bachelor: tDegree('bachelor'),
      master: tDegree('master'),
      doctorate: tDegree('doctorate'),
    };
    return degreeMap[degree] || degree;
  };

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
          <div className="absolute right-22 bottom-22">
            <UploadProfileDialog
              userId={user?.id}
              firstName={user?.firstName}
              lastName={user?.lastName}
            />
          </div>
          <div className="mt-4 text-center text-2xl font-bold">{`${user?.firstName} ${user?.lastName}`}</div>
          <div className="text-center text-lg font-medium text-red-700">
            {t('personal_information.teacher_position') ||
              'อาจารย์ประจำหลักสูตร'}
          </div>
        </div>
        <Separator className="mb-8" />

        {/* Info Grid */}
        <div className="mb-8 grid w-full max-w-7xl grid-cols-2 gap-x-32">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 px-12">
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
            <Separator />
            <div className="flex flex-col gap-2 px-12">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.degree')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <GraduationCap className="size-5 text-red-800" />
                </span>
                <span className="text-xl">
                  {mappedDegree(user?.degree ?? '')}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 px-12">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.degree')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <ScrollText className="size-6 text-red-800" />
                </span>
                <span className="text-xl">{user?.teacherDegree ?? '-'}</span>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 px-12">
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
            <Separator />
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 px-12">
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
            <Separator />
            <div className="flex flex-col gap-2 px-12">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.academic_position') ||
                  'ตำแหน่งวิชาการ'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <Medal className="size-6 text-red-800" />
                </span>
                <span className="text-xl">{user?.academicPosition ?? '-'}</span>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 px-12">
              <span className="mr-2 text-base font-medium text-gray-600">
                {t('personal_information.email')}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-center">
                  <Mail className="size-5 text-red-800" />
                </span>
                <span className="text-xl">{user?.email ?? '-'}</span>
              </div>
            </div>
            <Separator />
          </div>
        </div>
      </div>
    </div>
  );
};
