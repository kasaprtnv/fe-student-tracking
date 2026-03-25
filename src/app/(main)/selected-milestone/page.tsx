'use client';

import { useEffect, useState } from 'react';
import { X, GripVertical } from 'lucide-react';
import { startTransition } from 'react';

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
import { useCourse } from '@/hooks/use-course';
import { useMilestonePrerequisite } from '@/hooks/use-milestone-prerequisite';
import { useTranslations } from 'next-intl';
import { PageHeader } from '../../../components/page-header';
import { UnlockCondition } from '@/types/milestone-prerequisite';

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
import useSWR from 'swr';
import { toast } from 'sonner';

export default function PageLayout({ courseId }: { courseId?: string }) {
  const tSelectedMilestone = useTranslations('selected-milestone');
  const [lockedItems, setLockedItems] = useState<Record<string, boolean>>({});
  const [stepsByMilestone, setStepsByMilestone] = useState<
    Record<string, IMilestoneStep[]>
  >({});
  const [prerequisites, setPrerequisites] = useState<
    Record<string, UnlockCondition[]>
  >({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const {
    allMilestoneIds,
    getMilestoneById,
    fetchAllMilestones,
    reorderPositions,
    fetchCourseMilestones,
    removeCourseMilestoneFromCourse,
  } = useMilestone();

  const [pendingMilestone, setPendingMilestone] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { fetchAll: fetchAllPrereqs, update } = useMilestonePrerequisite();
  const { fetchMilestoneStepsByMilestone, fetchAllMilestoneSteps } =
    useMilestoneStep();

  const { data: swrData } = useSWR(
    `fetch-course-data-${courseId}`,
    async () => {
      const msResult = await fetchAllMilestones();
      const positionResult = await fetchCourseMilestones(courseId || '');
      const stepResult = await fetchAllMilestoneSteps();
      const prereqRes = await fetchAllPrereqs(); // fetch prerequisite ด้วย
      return { msResult, stepResult, prereqRes, positionResult };
    },
  );

  useEffect(() => {
    if (!swrData) return;

    const allMs = swrData.msResult?.data || [];
    const courseMs = swrData.positionResult?.data || [];
    const allSteps = swrData.stepResult?.data || [];
    const allPrereqs = swrData.prereqRes?.data || [];

    // map milestoneId -> position
    const positionMap = new Map<string, number>();
    courseMs.forEach((c) => {
      positionMap.set(c.milestone.id, c.position ?? 0);
    });

    // build selectedMilestones
    const selectedMilestones: (IMilestone & { position: number })[] = allMs
      .filter((m) => positionMap.has(m.id)) // ✅ เอาจาก course_milestone เท่านั้น
      .map((m) => ({
        ...m,
        position: positionMap.get(m.id)!,
      }))
      .sort((a, b) => a.position - b.position);

    const selectedIds = selectedMilestones.map((m) => m.id);

    const stepsMap: Record<string, IMilestoneStep[]> = {};
    allSteps.forEach((s) => {
      if (!stepsMap[s.milestoneId]) stepsMap[s.milestoneId] = [];
      stepsMap[s.milestoneId].push(s);
    });

    const filteredPrereqs = allPrereqs.filter((p) => p.courseId === courseId);

    const loadedPrereqs: Record<string, UnlockCondition[]> = {};
    const loadedLockedItems: Record<string, boolean> = {};

    filteredPrereqs.forEach((p) => {
      const targetId = p.targetMilestoneId || p.targetStepId;
      if (!targetId) return;

      const condition: UnlockCondition | null = p.requiredMilestoneId
        ? { type: 'milestone', id: p.requiredMilestoneId }
        : p.requiredStepId
          ? { type: 'step', id: p.requiredStepId }
          : null;

      if (!condition) return;

      if (!loadedPrereqs[targetId]) {
        loadedPrereqs[targetId] = [];
      }

      loadedPrereqs[targetId].push(condition);
      loadedLockedItems[targetId] = true;
    });

    /* -----------------------------
     * 4. set state
     * ----------------------------- */

    startTransition(() => {
      setSelectedItems(selectedIds);
      setStepsByMilestone(stepsMap);
      setPrerequisites(loadedPrereqs);
      setLockedItems(loadedLockedItems);
    });
  }, [swrData, courseId]);

  const milestones = allMilestoneIds
    .map((id) => getMilestoneById(id))
    .filter((ms) => ms !== undefined);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleRemove = async (milestoneId: string) => {
    if (!courseId) return;

    // await removeCourseMilestoneFromCourse(courseId, milestoneId);
    setSelectedItems((prev) => prev.filter((x) => x !== milestoneId));

    const stepIds = stepsByMilestone[milestoneId]?.map((s) => s.id) ?? [];

    // ล้าง prerequisites แบบ cascade
    setPrerequisites((prev) => {
      const updated: typeof prev = {};

      Object.entries(prev).forEach(([targetId, conds]) => {
        // ลบ target ที่เป็น milestone นี้ หรือ step ลูกของมัน
        if (targetId === milestoneId) return;
        if (stepIds.includes(targetId)) return;

        // ลบ condition ที่อ้าง milestone หรือ step ลูก
        const filtered = conds.filter(
          (c) => c.id !== milestoneId && !stepIds.includes(c.id),
        );

        if (filtered.length > 0) {
          updated[targetId] = filtered;
        }
      });

      return updated;
    });

    // ลบ lock
    setLockedItems((prev) => {
      const updated = { ...prev };
      delete updated[milestoneId];
      stepIds.forEach((id) => delete updated[id]);
      return updated;
    });

    // ลบ steps
    setStepsByMilestone((prev) => {
      const copy = { ...prev };
      delete copy[milestoneId];
      return copy;
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

  // เวลาเลือก milestone
  const handleSelect = async (id: string) => {
    if (!selectedItems.includes(id)) {
      setSelectedItems([...selectedItems, id]);
    }

    // โหลด step ของ milestone นี้
    const s = await fetchMilestoneStepsByMilestone(id);

    // เก็บลง map
    setStepsByMilestone((prev) => ({
      ...prev,
      [id]: s.data,
    }));
  };

  const selectedMilestonesWithSteps: IMilestone[] = selectedItems
    .map((id) => {
      const ms = getMilestoneById(id);
      if (!ms) return undefined;

      const steps: IMilestoneStep[] = stepsByMilestone[id] ?? [];
      const sortedSteps = steps
        .map((step) => ({
          ...step,
          status: 'available' as MilestoneStepStatus,
        }))
        .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));

      return {
        ...ms,
        steps: sortedSteps,
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
  const isCourseUsed = course?.isUsed;

  const handleConfirmSave = async () => {
    try {
      const courseMs = swrData?.positionResult?.data || [];
      const originalIds = courseMs.map((c) => c.milestone.id);

      const removedIds = originalIds.filter(
        (id) => !selectedItems.includes(id),
      );

      for (const id of removedIds) {
        await removeCourseMilestoneFromCourse(courseId!, id);
      }

      const positionPayload = selectedItems.map((milestoneId, index) => ({
        id: milestoneId,
        position: index + 1,
        courseId: courseId || '',
      }));

      await reorderPositions(positionPayload);

      const dto = buildPrerequisiteDTO();

      await update(courseId!, dto);

      setConfirmOpen(false);
      toast.success(tSelectedMilestone('confirm-save.success'));
    } catch (err) {
      console.error('Error saving prerequisites', err);
    }
  };

  interface PrerequisiteDTO {
    targetMilestoneId?: string;
    targetStepId?: string;
    requiredMilestoneId?: string;
    requiredStepId?: string;
    courseId?: string;
  }

  function willCauseLoop(targetId: string, requiredId: string): boolean {
    if (!targetId || !requiredId) return false;

    const visited = new Set<string>();

    const dfs = (currentId: string): boolean => {
      if (currentId === targetId) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);

      const nextConditions = prerequisites[currentId] ?? [];

      for (const cond of nextConditions) {
        if (dfs(cond.id)) return true;
      }

      return false;
    };

    return dfs(requiredId);
  }

  const buildPrerequisiteDTO = (): PrerequisiteDTO[] => {
    const result: PrerequisiteDTO[] = [];

    // 1️⃣ รวม target ทั้งหมด (milestone ที่เลือก + step ที่ถูก lock)
    const targetIds = new Set<string>();

    selectedItems.forEach((id) => targetIds.add(id));
    Object.keys(prerequisites).forEach((id) => targetIds.add(id));

    // 2️⃣ build DTO จากทุก target
    targetIds.forEach((targetId) => {
      const conditions = prerequisites[targetId] ?? [];
      const isMilestone = selectedItems.includes(targetId);

      // 🔗 มี condition → ส่งตามจริง (รองรับ milestone + step)
      conditions.forEach((cond) => {
        result.push({
          targetMilestoneId: isMilestone ? targetId : undefined,
          targetStepId: !isMilestone ? targetId : undefined,

          requiredMilestoneId: cond.type === 'milestone' ? cond.id : undefined,
          requiredStepId: cond.type === 'step' ? cond.id : undefined,

          courseId: courseId || undefined,
        });
      });
    });

    return result;
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: tSelectedMilestone('header.course'), href: '/course' },
          {
            label: tSelectedMilestone('header.select-milestone'),
            isPage: true,
          },
        ]}
      />
      <div className="container mx-auto h-[80%] pt-2 pb-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            {tSelectedMilestone('header.title')}
          </h1>
          {course && (
            <div>
              <div className="mb-2 text-xl text-gray-600">
                {tSelectedMilestone('header.course-code')} : {course.code}
                {' - '}
                {course.name}
              </div>
              <div className="mb-2 text-gray-600">
                {tSelectedMilestone('header.course-description')} :{' '}
                {course.description}
              </div>
            </div>
          )}
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full rounded-lg border"
        >
          {/* LEFT PANEL */}
          <ResizablePanel defaultSize={40} minSize={20} maxSize={50}>
            <div className="h-full space-y-4 overflow-auto p-4">
              <div className="mb-3 font-bold">
                {tSelectedMilestone('milestone.milestone')}
              </div>
              {/* Dropdown */}
              <Select
                value={pendingMilestone ?? ''}
                onValueChange={(value) => {
                  setPendingMilestone(value);
                }}
                disabled={isCourseUsed}
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
                          disabled={isCourseUsed}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </ResizablePanel>
          <Button
            className="bg-primary hover:bg-primary/90 mt-13 mr-4 flex"
            disabled={!pendingMilestone || isCourseUsed}
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
            <div>
              <div className="mb-3 font-bold">
                {tSelectedMilestone('milestone.preview')}
              </div>
            </div>
            <UnlockConditionModal
              key={
                lockModalOpen
                  ? `${targetLock?.type}-${targetLock?.id}`
                  : 'closed'
              }
              open={lockModalOpen}
              onClose={() => setLockModalOpen(false)}
              target={targetLock}
              milestones={selectedMilestonesWithSteps}
              isLoop={(requiredId, targetId) => {
                return willCauseLoop(targetId, requiredId);
              }}
              initialSelected={
                targetLock ? (prerequisites[targetLock.id] ?? []) : []
              }
              prerequisites={prerequisites}
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
                displayMode="select-milestone"
                lockInfoMap={prerequisites}
                courseIsUsed={isCourseUsed}
                stepAttempts={[]}
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
            disabled={isCourseUsed}
            className="bg-primary hover:bg-primary/90"
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
    </>
  );
}

function SortableItem({
  id,
  label,
  onRemove,
  disabled,
}: {
  id: string;
  label: string;
  onRemove: () => void;
  disabled?: boolean;
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
        className={`cursor-grab text-gray-500 active:cursor-grabbing ${disabled ? 'pointer-events-none opacity-50' : ''}`}
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
        disabled={disabled}
      >
        <X size={14} />
      </Button>
    </div>
  );
}
