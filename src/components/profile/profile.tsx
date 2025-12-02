import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ProfilePageProps {
  role: 'student' | 'teacher' | 'admin';
}

export const ProfileComponent: React.FC<ProfilePageProps> = ({ role }) => {
  const t = useTranslations('profile');
  return (
    <div>
      <div className="flex flex-row items-center gap-8">
        {/* Profile Image */}
        <div>
          <Avatar className="h-60 w-60">
            <AvatarImage src="/profile.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        {/* Information */}
        {role === 'student' && (
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.name')} :
                </div>
                <div className="text-xl">นางสาวนภพร เพ็ญบุตดี</div>
              </div>
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.student_id')} :
                </div>
                <div className="text-xl">65160339</div>
              </div>
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.department')} :
                </div>
                <div className="text-xl">วิชาการบริหารงานยุติธรรมและสังคม</div>
              </div>
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.faculty')} :
                </div>
                <div className="text-xl">วิทยาศาสตร์และเทคโนโลยี</div>
              </div>
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.year')} :
                </div>
                <div className="text-xl">2565</div>
              </div>
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.email')} :
                </div>
                <div className="text-xl">65160222@g.go.buu.ac.th</div>
              </div>
              <div className="flex">
                <div className="mr-2 text-xl">
                  {t('personal_information.degree')} :
                </div>
                <div className="text-xl">ปรัชญาดุษฎีบัณฑิต</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
