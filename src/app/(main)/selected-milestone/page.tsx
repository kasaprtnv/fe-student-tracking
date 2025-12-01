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
import type { Milestone, MilestoneStep, IMilestone } from '@/types/milestone';
import UnlockConditionModal from '@/components/lock-milestone/lock-milestone';

export default function PageLayout() {
  const { allMilestoneIds, getMilestoneById, fetchAllMilestones } =
    useMilestone();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // -----------------------------
  // Load milestones once
  // -----------------------------
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

  const handleRemove = (id: string) => {
    // remove จากซ้าย
    setSelectedItems(selectedItems.filter((x) => x !== id));

    // remove steps ของ milestone นั้น
    setStepsByMilestone((prev) => {
      const copy = { ...prev };
      delete copy[id];
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

    console.log('📌 FETCHED STEPS FOR:', id, s);

    // เก็บลง map
    setStepsByMilestone((prev) => ({
      ...prev,
      [id]: s.data,
    }));
  };

  const selectedMilestonesWithSteps: Milestone[] = selectedItems
    .map((id) => {
      const ms: IMilestone | undefined = getMilestoneById(id);
      if (!ms) return null;

      const steps: IMilestoneStep[] = stepsByMilestone[id] ?? [];

      return {
        id: ms.id,
        name: ms.name,
        description: ms.description ?? '',
        created_at: ms.created_at,
        updated_at: ms.updated_at,

        steps: steps.map((step) => ({
          id: step.id,
          milestoneId: step.milestoneId,
          position: step.position,
          name: step.name,
          description: step.description ?? '',
          requiresAttachment: step.requiresAttachment,
          isActive: step.isActive,
          dayPeriod: step.dayPeriod ?? 0,

          // IMilestoneStep ไม่มี status → ใส่ default ให้
          status: 'available',
        })),
      };
    })
    .filter((ms): ms is Milestone => ms !== null);

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

  return (
    <div className="h-full w-full p-6">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-lg border"
      >
        {/* LEFT PANEL */}
        <ResizablePanel defaultSize={40} minSize={20} maxSize={50}>
          <div className="h-full space-y-4 overflow-auto p-4">
            {/* Dropdown */}
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="h-12 w-full text-base">
                <SelectValue placeholder="เลือก Milestone" />
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

        <ResizableHandle />

        {/* RIGHT */}
        <ResizablePanel defaultSize={60} minSize={40} className="h-full p-4">
          <UnlockConditionModal
            key={targetLock?.id} // ⭐ เพิ่ม key ตรงนี้
            open={lockModalOpen}
            onClose={() => setLockModalOpen(false)}
            target={targetLock}
            milestones={selectedMilestonesWithSteps}
            onSave={(conditions) => {
              console.log('Saved conditions:', conditions);
              setLockModalOpen(false);
            }}
          />

          <div className="h-full overflow-auto">
            <MilestoneProgress
              milestones={selectedMilestonesWithSteps}
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
    </div>
  );
}

// ------------------------------------------
// Sortable Item Component
// ------------------------------------------
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

      {/* ⭐ ตรงนี้แหละที่ตัดข้อความแล้วเติม … */}
      <span className="flex-1 truncate overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        className="text-gray-600 hover:text-red-500"
      >
        <X size={14} />
      </button>
    </div>
  );
}
