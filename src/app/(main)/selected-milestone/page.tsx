'use client';

import { useEffect, useState } from 'react';
import { X, GripVertical } from 'lucide-react';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from '@/components/ui/resizable';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { useMilestone } from '@/hooks/use-milestone';
import type { DragEndEvent } from '@dnd-kit/core';
import { useMilestoneStep } from '@/hooks/use-milestone_step';
import { IMilestoneStep } from '@/types/milestone-step';
import MilestoneProgress from '@/components/milestone-progress/milestone-progress';
import type { IMilestone, MilestoneStepStatus } from '@/types/milestone';
import UnlockConditionModal from '@/components/lock-milestone/lock-milestone';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCourse } from '@/hooks/use-course';
import { useMilestonePrerequisite } from '@/hooks/use-milestone-prerequisite';
import { useTranslations } from 'next-intl';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UnlockCondition {
  type: 'milestone' | 'step';
  id: string;
}

export default function PageLayout({ courseId }: { courseId?: string }) {
  const tSelectedMilestone = useTranslations('selected-milestone');

  const { allMilestoneIds, getMilestoneById, fetchAllMilestones } =
    useMilestone();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [pendingMilestone, setPendingMilestone] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { createMany } = useMilestonePrerequisite();

  useEffect(() => {
    fetchAllMilestones().then((data) => {
      console.log('📌 Loaded milestones:', data);
    });
  }, [fetchAllMilestones]);

  const milestones = allMilestoneIds
    .map((id) => getMilestoneById(id))
    .filter((ms) => ms !== undefined);

  // DND sensors
  const sensors = useSensors(useSensor(PointerSensor));

  const [lockedItems, setLockedItems] = useState<Record<string, boolean>>({});

  const handleRemove = (id: string) => {
    // remove จากซ้าย
    setSelectedItems(selectedItems.filter((x) => x !== id));

    // remove steps ของ milestone นั้น
    setStepsByMilestone((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    // ลบ lock ของ milestone และ step ที่เกี่ยวข้อง
    setLockedItems((prev) => {
      const updated = { ...prev };

      // ลบ lock ของ milestone เอง
      delete updated[id];

      // ลบ lock ของทุก step ใน milestone นี้
      const steps = stepsByMilestone[id] ?? [];
      steps.forEach((step) => {
        delete updated[step.id];
      });

      return updated;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId !== overId) {
      const oldIndex = selectedItems.indexOf(activeId);
      const newIndex = selectedItems.indexOf(overId);

      setSelectedItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const [stepsByMilestone, setStepsByMilestone] = useState<
    Record<string, IMilestoneStep[]>
  >({});

  const { fetchMilestoneStepsByMilestone } = useMilestoneStep();

  // เวลาเลือก milestone
  const handleSelect = async (id: string) => {
    if (!selectedItems.includes(id)) {
      setSelectedItems([...selectedItems, id]);
    }

    // โหลด step ของ milestone นี้
    const s = await fetchMilestoneStepsByMilestone(id);

    console.log('FETCHED STEPS FOR:', id, s);

    // เก็บลง map
    setStepsByMilestone((prev) => ({
      ...prev,
      [id]: s.data,
    }));
  };

  const [prerequisites, setPrerequisites] = useState<
    Record<string, UnlockCondition[]>
  >({});

  const selectedMilestonesWithSteps: IMilestone[] = selectedItems
    .map((id) => {
      const ms = getMilestoneById(id);
      if (!ms) return undefined;

      const steps: IMilestoneStep[] = stepsByMilestone[id] ?? [];

      return {
        ...ms,
        steps: steps.map((step) => ({
          ...step,
          // IMilestoneStep ไม่มี status → ใส่ default ให้
          status: 'available' as MilestoneStepStatus,
        })),
      };
    })
    .filter((ms) => ms !== undefined);

  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [targetLock, setTargetLock] = useState<{
    type: 'milestone' | 'step';
    id: string;
    milestoneId?: string;
  } | null>(null);

  function findMilestoneIdByStepId(stepId: string) {
    for (const [msId, steps] of Object.entries(stepsByMilestone)) {
      if (steps.some((s) => s.id === stepId)) return msId;
    }
    return undefined;
  }

  const { getCourseById, fetchAllCourses } = useCourse();

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const course = getCourseById(courseId);

  const handleConfirmSave = async () => {
    try {
      const dto = buildPrerequisiteDTO();
      console.log('DTO TO SEND:', dto);

      await createMany(dto);

      setConfirmOpen(false);
      // toast.success("บันทึกสำเร็จ");
    } catch (err) {
      console.error('Error saving prerequisites', err);
    }
  };

  interface PrerequisiteDTO {
    targetMilestoneId?: string;
    targetStepId?: string;
    requiredMilestoneId?: string;
    requiredStepId?: string;
  }

  function detectTargetType(targetId: string): 'milestone' | 'step' {
    if (selectedItems.includes(targetId)) return 'milestone';
    return 'step';
  }

  const buildPrerequisiteDTO = (): PrerequisiteDTO[] => {
    const result: PrerequisiteDTO[] = [];

    Object.entries(prerequisites).forEach(([targetId, conditions]) => {
      const targetType = detectTargetType(targetId);

      conditions.forEach((cond) => {
        result.push({
          targetMilestoneId: targetType === 'milestone' ? targetId : undefined,
          targetStepId: targetType === 'step' ? targetId : undefined,

          requiredMilestoneId: cond.type === 'milestone' ? cond.id : undefined,

          requiredStepId: cond.type === 'step' ? cond.id : undefined,
        });
      });
    });

    return result;
  };

  return (
    <div className="h-full w-full p-6 pb-50">
      <div className="mb-2 flex items-center gap-2 text-sm">
        <Link href="/course" className="text-black hover:underline">
          course
        </Link>
        <span>-</span>
        <div className="text-black">milestone</div>
      </div>
      <div className="mb-2 text-2xl font-bold">
        {tSelectedMilestone('header.title')}
      </div>
      {course && (
        <div>
          <div className="mb-2 text-xl text-gray-600">
            Course name : {course.name}
          </div>
          <div className="mb-2 text-gray-600">
            Description : {course.description}
          </div>
        </div>
      )}
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-lg border"
      >
        {/* LEFT PANEL */}
        <ResizablePanel defaultSize={40} minSize={20} maxSize={50}>
          <div className="h-full space-y-4 overflow-auto p-4">
            <div className="mb-3">
              {tSelectedMilestone('milestone.milestone')}
            </div>
            {/* Dropdown */}
            <Select
              value={pendingMilestone ?? ''}
              onValueChange={(value) => {
                setPendingMilestone(value);
              }}
            >
              <SelectTrigger className="h-12 w-full text-base">
                <SelectValue
                  placeholder={tSelectedMilestone(
                    'milestone.select-placeholder',
                  )}
                />
              </SelectTrigger>

              <SelectContent>
                {milestones.map((ms) => {
                  const isSelected = selectedItems.includes(ms.id);
                  return (
                    <SelectItem
                      key={ms.id}
                      value={ms.id}
                      disabled={isSelected}
                      className={`w-full truncate overflow-hidden text-ellipsis whitespace-nowrap ${isSelected ? 'pointer-events-none opacity-50' : ''} `}
                    >
                      {ms.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* label */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {selectedItems.map((id) => {
                    const ms = getMilestoneById(id);
                    if (!ms) return null;

                    return (
                      <SortableItem
                        key={ms.id}
                        id={ms.id}
                        label={ms.name}
                        onRemove={() => handleRemove(ms.id)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </ResizablePanel>
        <Button
          className="mt-13 mr-4 flex"
          disabled={!pendingMilestone}
          onClick={() => {
            if (!pendingMilestone) return;

            handleSelect(pendingMilestone);
            setPendingMilestone(null);
          }}
        >
          {tSelectedMilestone('milestone.add')}
        </Button>

        <ResizableHandle />

        {/* RIGHT */}
        <ResizablePanel defaultSize={60} minSize={40} className="h-full p-4">
          <UnlockConditionModal
            key={
              lockModalOpen ? `${targetLock?.type}-${targetLock?.id}` : 'closed'
            }
            open={lockModalOpen}
            onClose={() => setLockModalOpen(false)}
            target={targetLock}
            milestones={selectedMilestonesWithSteps}
            initialSelected={
              targetLock ? (prerequisites[targetLock.id] ?? []) : []
            }
            onSave={(conditions) => {
              setPrerequisites((prev) => ({
                ...prev,
                [targetLock!.id]: conditions,
              }));

              setLockedItems((prev) => ({
                ...prev,
                [targetLock!.id]: conditions.length > 0,
              }));

              setLockModalOpen(false);
            }}
          />

          <div className="h-full overflow-auto">
            <MilestoneProgress
              milestones={selectedMilestonesWithSteps}
              lockedItems={lockedItems}
              mode="edit"
              onToggleLock={(id, type) => {
                setTargetLock({
                  id,
                  type,
                  milestoneId:
                    type === 'step' ? findMilestoneIdByStepId(id) : id,
                });

                setLockModalOpen(true);
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={selectedItems.length === 0}
        >
          {tSelectedMilestone('milestone.next')}
        </Button>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tSelectedMilestone('confirm-save.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tSelectedMilestone('confirm-save.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              {tSelectedMilestone('confirm-save.cancel')}
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleConfirmSave}>
              {tSelectedMilestone('confirm-save.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableItem({
  id,
  label,
  onRemove,
}: {
  id: string;
  label: string;
  onRemove: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow"
    >
      <div
        {...listeners}
        className="cursor-grab text-gray-500 active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>
      <span className="flex-1 truncate overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        variant="ghost"
        className="text-gray-600 hover:text-red-500"
      >
        <X size={14} />
      </Button>
    </div>
  );
}
