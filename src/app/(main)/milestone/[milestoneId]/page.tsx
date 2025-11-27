import { useParams } from 'next/navigation';

const MilestoneStepPage = () => {
  const { milestoneId } = useParams();

  return (
    <>
      <div>Milestone Step Page for Milestone ID: {milestoneId}</div>
    </>
  );
};

export default MilestoneStepPage;
