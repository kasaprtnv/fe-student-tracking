import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '@/types/user';

interface ProfilePageProps {
  user: User | null;
}

export const ProfileComponent: React.FC<ProfilePageProps> = ({ user }) => {
  const t = useTranslations('profile');
  const role = user?.role === 'student' ? 'student' : user?.role;
  return (
    <div>
      <div className="mb-4 text-2xl font-bold">
        {t('personal_information.title')}
      </div>
      <div className="flex flex-row items-center gap-8">
        {/* Profile Image */}
        <div>
          <Avatar className="h-60 w-60 bg-white">
            <AvatarImage src="/profile.png" />
            <AvatarFallback>{`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`}</AvatarFallback>
          </Avatar>
        </div>
        {/* Information */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-x-2 gap-y-4">
            <div className="flex">
              <div className="mr-2 text-xl">
                {t('personal_information.name')} :
              </div>
              <div className="text-xl">
                {`${user?.firstName} ${user?.lastName}`}
              </div>
            </div>
            {role === 'student' && (
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.student_id')} :
                </div>
                <div className="text-xl">{user?.code}</div>
              </div>
            )}
            <div className="flex">
              <div className="mr-2 text-xl">
                {t('personal_information.faculty')} :
              </div>
              <div className="text-xl">รัฐศาสตร์</div>
            </div>
            <div className="flex">
              <div className="mr-2 text-xl">
                {t('personal_information.department')} :
              </div>
              <div className="text-xl">วิชาการบริหารงานยุติธรรมและสังคม</div>
            </div>
            {role === 'student' && (
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.year')} :
                </div>
                <div className="text-xl">{user?.year}</div>
              </div>
            )}
            <div className="flex">
              <div className="mr-2 text-xl">
                {t('personal_information.email')} :
              </div>
              <div className="text-xl">{user?.email}</div>
            </div>
            {role === 'student' && (
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.degree')} :
                </div>
                <div className="text-xl">{user?.degree}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
