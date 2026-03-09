'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useMilestoneStep } from '@/hooks/use-milestone_step';
import { useMilestone } from '@/hooks/use-milestone';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import CreateMilestoneStepForm from './create-milestone-step-form';
import UpdateMilestoneStepForm from './update-milestone-step-form';
import DeleteConfirmationDialog from '@/components/delete-dialog';
import { IMilestone } from '@/types/milestone';
import { IMilestoneStep } from '@/types/milestone-step';
import MilestoneStepCard from '@/components/milestone-step/milestone-step-card';
import { PageHeader } from '@/components/page-header';
import { Loader, Plus } from 'lucide-react';
import { toast } from 'sonner';

const MilestoneStepPage = () => {
  const { milestoneId } = useParams();
  const milestoneIdString = milestoneId as string;
  const t = useTranslations('milestone-step');
  const tMilestone = useTranslations('milestone');

  const {
    fetchMilestoneStepsByMilestone,
    getMilestoneStepsByMilestoneId,
    updateMultiMilestoneSteps,
    deleteMilestoneStepById,
    storeAction,
  } = useMilestoneStep();
  const { fetchMilestoneDetails, getMilestoneById } = useMilestone();

  const [milestone, setMilestone] = React.useState<IMilestone>(
    {} as IMilestone,
  );
  const [steps, setSteps] = React.useState<IMilestoneStep[]>([]);
  const [originalSteps, setOriginalSteps] = React.useState<IMilestoneStep[]>(
    [],
  ); // Store original positions
  const [isAdd, setIsAdd] = React.useState<boolean>(false);
  const [isEdit, setIsEdit] = React.useState<boolean>(false);
  const [isDelete, setIsDelete] = React.useState<boolean>(false);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [selectedStep, setSelectedStep] = React.useState<
    IMilestoneStep | undefined
  >(undefined);

  // Fetch milestone and milestone steps
  React.useEffect(() => {
    const loadMilestone = async () => {
      if (milestoneId) {
        const data = getMilestoneById(milestoneIdString);
        await fetchMilestoneStepsByMilestone(milestoneIdString);
        if (data) {
          setMilestone(data);
        } else {
          const fetchedMilestone =
            await fetchMilestoneDetails(milestoneIdString);
          setMilestone(fetchedMilestone.data);
        }
      }
    };
    loadMilestone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneId]);

  React.useEffect(() => {
    const fetchedSteps = getMilestoneStepsByMilestoneId(milestoneIdString);

    const sortedSteps = fetchedSteps.sort((a, b) => a.position - b.position);

    setSteps(sortedSteps);
    setOriginalSteps(sortedSteps);
  }, [getMilestoneStepsByMilestoneId, milestoneIdString]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedSteps = Array.from(steps);
    const [movedStep] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, movedStep);

    // Update positions in the reordered list
    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      position: index + 1,
    }));

    setSteps(updatedSteps);
  };

  const confirmUpdatePositions = async () => {
    try {
      await updateMultiMilestoneSteps(steps);
      toast.success(t('milestone-step-form.toast.position-updated'));
      setOriginalSteps(steps); // Update original positions after saving
    } catch (error) {
      console.error('Failed to update positions:', error);
    }
  };

  const handleEdit = (step: IMilestoneStep) => {
    setSelectedStep(step);
    setIsEdit(true);
  };

  const handleDelete = (step: IMilestoneStep) => {
    setSelectedStep(step);
    setIsDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedStep) return;
    setIsDeleting(true);
    try {
      await deleteMilestoneStepById(selectedStep.id);
      setIsDelete(false);
      toast.success(t('milestone-step-form.toast.deleted-successfully'));
    } catch (error) {
      console.error('Failed to delete milestone step:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if positions have changed
  const hasPositionChanged = React.useMemo(() => {
    return JSON.stringify(steps) !== JSON.stringify(originalSteps);
  }, [steps, originalSteps]);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: tMilestone('title'), href: '/milestone' },
          { label: milestone?.name || '', isPage: true },
        ]}
      />
      <div className="container mx-auto space-y-4 py-8">
        <div>
          <h1 className="text-2xl font-bold">
            {t('milestone')} : {milestone?.name}
          </h1>
          <p className="mt-2 break-words text-gray-600 sm:max-w-[500px] lg:max-w-[750px]">
            {t('description')}: {milestone?.description}
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => setIsAdd(true)}
            className="mb-4"
            disabled={milestone?.isUsed}
          >
            <Plus size={16} />
            {t('add-step')}
          </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="milestone-steps">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {steps.map((step, index) => (
                  <Draggable
                    key={step.id}
                    draggableId={step.id}
                    index={index}
                    isDragDisabled={milestone?.isUsed}
                  >
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <MilestoneStepCard
                          milestone={milestone}
                          step={step}
                          dragHandleProps={
                            provided.dragHandleProps ?? undefined
                          }
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {hasPositionChanged && ( // Show button only if positions have changed
          <div className="flex w-full justify-end">
            <Button
              onClick={confirmUpdatePositions}
              disabled={storeAction === 'updating' || milestone?.isUsed}
              className="mt-4 ml-auto"
            >
              {storeAction === 'updating' && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('milestone-step-form.label.confirm-position')}
            </Button>
          </div>
        )}

        <CreateMilestoneStepForm
          isOpen={isAdd}
          onClose={() => setIsAdd(false)}
          milestoneId={milestoneIdString}
          stepsLength={steps.length}
        />
        <UpdateMilestoneStepForm
          isOpen={isEdit}
          onClose={() => setIsEdit(false)}
          milestoneStep={selectedStep}
        />
        <DeleteConfirmationDialog
          open={isDelete}
          onClose={() => setIsDelete(false)}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="delete.header"
          description="delete.confirm"
          translationKey="milestone-step"
        />
      </div>
    </>
  );
};

export default MilestoneStepPage;
