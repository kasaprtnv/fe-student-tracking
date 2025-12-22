'use client';

import { useState } from 'react';
import type { IMilestone } from '@/types/milestone';
import { useTranslations } from 'next-intl';

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
  isLoop: (requiredId: string) => boolean;
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
}: UnlockConditionModalProps) {
  const [selected, setSelected] = useState<UnlockCondition[]>(
    initialSelected ?? [],
  );
  const tSelectedMilestone = useTranslations('selected-milestone');

  if (!open || !target) return null;

  const toggle = (type: 'milestone' | 'step', id: string) => {
    setSelected((prev) =>
      prev.some((x) => x.id === id)
        ? prev.filter((x) => x.id !== id)
        : [...prev, { type, id }],
    );
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

  // รวม Step ทั้งหมดของทุก Milestone
  const allSteps = Object.values(milestones).flatMap((m) => m.steps ?? []);

  const isDisabled = (type: 'milestone' | 'step', id: string) => {
    // 1. ห้ามเลือกตัวเองเป็นเงื่อนไข
    if (id === target.id) return true;

    // 2. ถ้าเรากำลังตั้งเงื่อนไขให้ Step: ห้ามเลือก Milestone แม่ของตัวเอง (ป้องกัน Loop ในตัว)
    if (
      target.type === 'step' &&
      type === 'milestone' &&
      id === target.milestoneId
    ) {
      return true;
    }

    // 3. เช็ค Loop ผ่านฟังก์ชันที่เราปรับปรุงใหม่ด้านบน
    if (isLoop(id)) return true;

    // 4. เช็คสถานะ Lock พื้นฐาน
    if (type === 'step') {
      const step = allSteps.find((s) => s.id === id);
      if (step?.status === 'locked') return true;
    }

    // 5. ป้องกันการเลือกซ้ำซ้อน: ถ้าเลือก Milestone แม่ไปแล้ว ไม่ต้องให้เลือก Step ในนั้นอีก
    if (type === 'step') {
      const msOfStep = milestones.find((m) =>
        (m.steps ?? []).some((s) => s.id === id),
      );
      if (
        msOfStep &&
        selected.some((c) => c.type === 'milestone' && c.id === msOfStep.id)
      ) {
        return true;
      }
    }

    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-h-[85vh] w-[500px] overflow-auto rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
          {tSelectedMilestone('unlock-condition.title')}
        </h2>
        {/* No data */}
        {hasNoData && (
          <p className="py-8 text-center text-gray-500">
            {tSelectedMilestone('unlock-condition.no-conditions')}
          </p>
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
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200'
                    }`}
                  >
                    <p className="font-medium">{ms.name}</p>
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
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200'
                      }`}
                    >
                      <p className="font-medium">{step.name}</p>
                      <p className="text-xs text-gray-500">
                        {' '}
                        {tSelectedMilestone('unlock-condition.from')}: {ms.name}
                      </p>
                    </div>
                  )),
              )}
            </div>
          </>
        )}
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
      </div>
    </div>
  );
}
