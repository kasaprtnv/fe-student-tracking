'use client';

import { useState, useEffect } from 'react';
import type { IMilestone } from '@/types/milestone';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';

interface UnlockCondition {
  type: 'milestone' | 'step';
  id: string;
}

interface UnlockConditionModalProps {
  open: boolean;
  onClose: () => void;
  target: {
    type: 'milestone' | 'step';
    id: string;
    milestoneId?: string;
  } | null;
  milestones: IMilestone[];
  onSave: (conditions: UnlockCondition[]) => void;
  initialSelected?: UnlockCondition[];
  isLoop: (requiredId: string, targetId: string) => boolean;
  prerequisites: Record<string, UnlockCondition[]>;
}

export default function UnlockConditionModal({
  open,
  onClose,
  target,
  milestones,
  onSave,
  initialSelected,
  isLoop,
  prerequisites,
}: UnlockConditionModalProps) {
  const [selected, setSelected] = useState<UnlockCondition[]>(
    initialSelected ?? [],
  );
  const tSelectedMilestone = useTranslations('selected-milestone');

  const promoteStepsToMilestone = (
    currentSelected: UnlockCondition[],
  ): UnlockCondition[] => {
    let nextSelected = [...currentSelected];

    milestones.forEach((ms) => {
      if (nextSelected.some((s) => s.type === 'milestone' && s.id === ms.id))
        return;

      const stepIds = (ms.steps ?? []).map((s) => s.id);
      if (stepIds.length === 0) return;

      const isAllStepsSelected = stepIds.every((sId) =>
        nextSelected.some((s) => s.type === 'step' && s.id === sId),
      );

      if (isAllStepsSelected) {
        nextSelected = nextSelected.filter(
          (s) => !(s.type === 'step' && stepIds.includes(s.id)),
        );

        nextSelected.push({ type: 'milestone', id: ms.id });
      }
    });

    return nextSelected;
  };

  if (!open || !target) return null;

  const toggle = (type: 'milestone' | 'step', id: string) => {
    let newSelected = [...selected];

    const existingIndex = newSelected.findIndex(
      (s) => s.type === type && s.id === id,
    );

    if (existingIndex >= 0) {
      newSelected.splice(existingIndex, 1);
    } else {
      newSelected.push({ type, id });
    }

    newSelected = promoteStepsToMilestone(newSelected);
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const milestoneCount = milestones.filter((ms) => {
    if (target.type === 'milestone') return ms.id !== target.id;
    if (target.type === 'step') return ms.id !== target.milestoneId;
    return true;
  }).length;

  const stepCount = milestones.flatMap((ms) =>
    (ms.steps ?? []).filter((step) => {
      if (target.type === 'milestone') return ms.id !== target.id;
      if (target.type === 'step') return step.id !== target.id;
      return true;
    }),
  ).length;

  const hasNoData = milestoneCount === 0 && stepCount === 0;

  const findMilestoneIdOfStep = (stepId: string) => {
    return milestones.find((m) => (m.steps ?? []).some((s) => s.id === stepId))
      ?.id;
  };

  const isPrerequisiteOfTarget = (candidateId: string, targetId: string) => {
    const conditions = prerequisites[targetId] ?? [];
    return conditions.some((c) => c.id === candidateId);
  };

  const getMilestonesLockedBy = (milestoneId: string) => {
    return Object.entries(prerequisites)
      .filter(([_, conds]) => conds.some((c) => c.id === milestoneId))
      .map(([lockedId]) => lockedId);
  };

  const getMilestonesLocking = (milestoneId: string) => {
    const conds = prerequisites[milestoneId] ?? [];
    return conds.filter((c) => c.type === 'milestone').map((c) => c.id);
  };

  const getTargetMilestoneId = () =>
    target.type === 'milestone' ? target.id : target.milestoneId;

  const isDisabled = (type: 'milestone' | 'step', id: string) => {
    if (isSelected(id)) return false;
    const targetMsId = getTargetMilestoneId();

    if (type === 'milestone' && targetMsId) {
      const candidateSteps = milestones.find((m) => m.id === id)?.steps ?? [];

      const isAnyStepWaitingForTarget = candidateSteps.some((step) =>
        isPrerequisiteOfTarget(targetMsId, step.id),
      );

      if (isAnyStepWaitingForTarget) {
        return true;
      }
    }

    // 1. ห้ามเลือกตัวเอง
    if (type === 'milestone' && id === targetMsId) return false;
    if (id === target.id) return true;

    if (type === 'milestone') {
      // ตรวจสอบว่า Milestone นี้ "หรือลูกๆ ของมัน" มีตัวไหนที่รอ Target อยู่ก่อนแล้วหรือไม่
      const msData = milestones.find((m) => m.id === id);
      const isSelfLoop = isLoop(id, target.id);
      const isAnyChildLoop = (msData?.steps ?? []).some((s) =>
        isLoop(s.id, target.id),
      );

      if (isSelfLoop || isAnyChildLoop) return true;
    }

    if (type === 'step') {
      // ตรวจสอบว่า Step นี้ "หรือแม่ของมัน" มีตัวไหนที่รอ Target อยู่ก่อนแล้วหรือไม่
      const stepMsId = findMilestoneIdOfStep(id);
      const isSelfLoop = isLoop(id, target.id);
      const isParentLoop = stepMsId ? isLoop(stepMsId, target.id) : false;
      if (isSelfLoop || isParentLoop) return true;
    }

    // 2. step ห้ามเลือก milestone แม่ตัวเอง
    if (
      target.type === 'step' &&
      type === 'milestone' &&
      id === target.milestoneId
    ) {
      return true;
    }

    // 3. กัน loop
    if (isLoop(id, target.id)) return true;

    if (target.type === 'step' && targetMsId) {
      // กรณีที่เรากำลังดู Milestone (id) เพื่อจะเอามาเป็นเงื่อนไขล็อก Step นี้
      if (type === 'milestone') {
        // กฎ: ถ้า Milestone นี้ (id) ล็อก Milestone แม่ของ Target อยู่แล้ว
        // เราไม่ควรให้เลือก Milestone นี้มาล็อก Step ลูกอีก (เพราะมันล็อกทั้งยวงไปแล้ว)
        // หรือเพื่อป้องกันความซ้ำซ้อน/สับสน
        if (isPrerequisiteOfTarget(id, targetMsId)) {
          return true;
        }

        // กฎป้องกัน Loop: ถ้า Milestone แม่ของ Target ไปล็อก Milestone นี้ไว้
        // ห้ามเอา Milestone นี้มาเป็นเงื่อนไขของ Step ลูก (ป้องกัน Cycle)
        if (isPrerequisiteOfTarget(targetMsId, id)) {
          return true;
        }
      }
    }

    // 3. เพิ่มการเช็ค Milestone-to-Milestone locking
    // (กรณี Milestone 1 ล็อก Milestone 2 อยู่แล้ว)
    if (type === 'milestone' && targetMsId) {
      // เช็คว่ามีความสัมพันธ์เชิงประจักษ์ว่า id นี้ ล็อก targetMsId หรือไม่
      const isParentLocked = prerequisites[targetMsId]?.some(
        (c) => c.id === id,
      );
      if (isParentLocked) return true;
    }

    // 4. ถ้าเป็น prerequisite อยู่แล้ว แต่ไม่ได้เลือก → disable
    if (isPrerequisiteOfTarget(id, target.id)) {
      return true;
    }

    //CASE 1: ถ้า Target เป็น Step และ "แม่ของ Target" ถูก Lock โดย id นี้
    if (target.type === 'step' && targetMsId) {
      // เช็คว่า id นี้ เป็นเงื่อนไขของ แม่ target หรือไม่
      if (isPrerequisiteOfTarget(id, targetMsId)) {
        return true;
      }
    }

    //CASE 2: ถ้า id ที่เรากำลังดูเป็น Step และ "แม่ของ id" ไป Lock Target ไว้
    if (type === 'step') {
      const candidateStepMsId = findMilestoneIdOfStep(id);
      // เช็คว่า แม่ของ id (candidateStepMsId) มี Target เป็นเงื่อนไขหรือไม่
      if (
        candidateStepMsId &&
        isPrerequisiteOfTarget(target.id, candidateStepMsId)
      ) {
        return true;
      }
    }

    // 5. ถ้าเลือก milestone แม่แล้ว → disable step ในนั้น
    if (type === 'step') {
      const stepMsId = findMilestoneIdOfStep(id);
      if (
        stepMsId &&
        selected.some((c) => c.type === 'milestone' && c.id === stepMsId)
      ) {
        return true;
      }
    }

    if (!targetMsId) return false;

    // A lock B แล้ว → เวลาอยู่ฝั่ง A → disable B + step ของ B
    const lockedByTarget = getMilestonesLockedBy(targetMsId);

    //CASE 3: ถ้า Target เป็น Milestone และมี Step ภายใต้ตัวมันถูก id นี้ (หรือแม่ของมัน) Lock ไว้แล้ว
    if (target.type === 'milestone') {
      const targetSteps =
        milestones.find((m) => m.id === target.id)?.steps ?? [];

      // 1. เช็คว่า id นี้ (จะเป็น Milestone หรือ Step ก็ตาม) ไป Lock "Step ลูก" ของ Target ไว้หรือไม่
      const isLockingSomeStep = targetSteps.some((s) =>
        isPrerequisiteOfTarget(id, s.id),
      );
      if (isLockingSomeStep) return true;

      // 2. กรณี id ที่เรากำลังดูเป็น Step: เช็คว่า "แม่ของมัน (Milestone)" ไป Lock "Step ลูก" ของ Target หรือไม่
      if (type === 'step') {
        const candidateMsId = findMilestoneIdOfStep(id);
        if (
          candidateMsId &&
          targetSteps.some((s) => isPrerequisiteOfTarget(candidateMsId, s.id))
        ) {
          return true;
        }
      }

      // 3. เช็คว่า "Step ลูก" ของ Target ไป Lock id นี้ไว้หรือไม่ (ป้องกัน Loop ขาไป)
      const isLockedBySomeStep = targetSteps.some((s) =>
        isPrerequisiteOfTarget(s.id, id),
      );
      if (isLockedBySomeStep) return true;
    }

    if (type === 'milestone') {
      const candidateSteps = milestones.find((m) => m.id === id)?.steps ?? [];
      const targetSteps =
        milestones.find((m) => m.id === targetMsId)?.steps ?? [];

      const hasChildConflict = candidateSteps.some((cStep) =>
        targetSteps.some((tStep) => {
          const conds = prerequisites[tStep.id] ?? [];
          return conds.some((c) => c.type === 'milestone' && c.id === id);
        }),
      );

      if (hasChildConflict) return true;
    }

    if (type === 'milestone') {
      const targetSteps =
        milestones.find((m) => m.id === target.id)?.steps ?? [];

      // เช็คว่า Milestone นี้ (id) มีลูกตัวไหนไป "ล็อก" ลูกของ Target อยู่หรือไม่
      const candidateSteps = milestones.find((m) => m.id === id)?.steps ?? [];
      const isAnyChildLockingTargetChild = candidateSteps.some((cStep) =>
        targetSteps.some((tStep) => isPrerequisiteOfTarget(cStep.id, tStep.id)),
      );

      if (isAnyChildLockingTargetChild) {
        return true;
      }
    }

    if (type === 'milestone') {
      const lockingTarget = getMilestonesLocking(targetMsId);
      if (lockingTarget.includes(id)) {
        return true;
      }
    }

    if (type === 'step') {
      const stepMsId = findMilestoneIdOfStep(id);

      if (!stepMsId) return false;

      // ถ้า Target Lock "แม่มัน" หรือ Lock "ตัวมันเอง" -> ต้อง Disable
      if (lockedByTarget.includes(stepMsId) || lockedByTarget.includes(id)) {
        return true;
      }

      // ถ้า "แม่มัน" มา Lock หรือ "ตัวมันเอง" มา Lock Target -> ต้อง Disable (กัน Loop)
      const lockingTarget = getMilestonesLocking(targetMsId);
      if (lockingTarget.includes(stepMsId) || lockingTarget.includes(id)) {
        return true;
      }
    }

    if (type === 'milestone') {
      const candidateSteps = milestones.find((m) => m.id === id)?.steps ?? [];
      const targetSteps =
        milestones.find((m) => m.id === targetMsId)?.steps ?? [];

      const isAnyChildLooping = candidateSteps.some((cStep) =>
        isLoop(cStep.id, target.id),
      );

      // 2. ถ้ามี Step ใดๆ ใน "Candidate" กำลังทำให้ "ลูกของ Target" เกิด Loop
      const isAnyChildLoopingTargetSteps = candidateSteps.some((cStep) =>
        targetSteps.some((tStep) => isLoop(cStep.id, tStep.id)),
      );

      if (isAnyChildLooping || isAnyChildLoopingTargetSteps) {
        return true;
      }
    }

    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[85vh] w-[500px] overflow-auto rounded-xl bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute left-291 p-1 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="mb-4 text-xl font-semibold">
          {tSelectedMilestone('unlock-condition.title')}
        </h2>
        {/* No data */}
        {hasNoData && (
          <div>
            <p className="py-8 text-center text-gray-500">
              {tSelectedMilestone('unlock-condition.no-conditions')}
            </p>
          </div>
        )}
        {/* Milestones */}
        {!hasNoData && milestoneCount > 0 && (
          <>
            <h3 className="mb-2 text-sm font-medium">
              {tSelectedMilestone('unlock-condition.milestone-section')}
            </h3>

            <div className="mb-6 space-y-2">
              {milestones
                .filter((ms) => {
                  if (target.type === 'milestone') {
                    return ms.id !== target.id;
                  }
                  if (target.type === 'step') {
                    return ms.id !== target.milestoneId;
                  }
                  return true;
                })
                .map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() =>
                      !isDisabled('milestone', ms.id) &&
                      toggle('milestone', ms.id)
                    }
                    className={`cursor-pointer rounded-lg border p-3 ${
                      isDisabled('milestone', ms.id)
                        ? 'cursor-not-allowed opacity-40'
                        : isSelected(ms.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{ms.name}</p>
                      {isSelected(ms.id) && (
                        <Lock className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
        {/* Steps */}
        {!hasNoData && stepCount > 0 && (
          <>
            <h3 className="mb-2 text-sm font-medium">
              {tSelectedMilestone('unlock-condition.step-section')}
            </h3>

            <div className="space-y-2">
              {milestones.map((ms) =>
                (ms.steps ?? [])
                  .filter((step) => {
                    if (target.type === 'milestone') return ms.id !== target.id;
                    if (target.type === 'step') return step.id !== target.id;
                    return true;
                  })
                  .map((step) => (
                    <div
                      key={step.id}
                      onClick={() =>
                        !isDisabled('step', step.id) && toggle('step', step.id)
                      }
                      className={`cursor-pointer rounded-lg border p-3 ${
                        isDisabled('step', step.id)
                          ? 'cursor-not-allowed opacity-40'
                          : isSelected(step.id)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-xs text-gray-500">
                            {tSelectedMilestone('unlock-condition.from')}:{' '}
                            {ms.name}
                          </p>
                        </div>

                        {isSelected(step.id) && (
                          <Lock className="mt-1 h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  )),
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg border px-4 py-2" onClick={onClose}>
                {tSelectedMilestone('unlock-condition.cancel')}
              </button>

              <button
                className="rounded-lg bg-black px-4 py-2 text-white"
                onClick={() => onSave(selected)}
              >
                {tSelectedMilestone('unlock-condition.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
