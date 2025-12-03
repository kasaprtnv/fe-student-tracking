'use client';

import React, { useState } from 'react';
import type { Milestone } from '@/types/milestone';
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
  milestones: Milestone[];
  onSave: (conditions: UnlockCondition[]) => void;
  initialSelected?: UnlockCondition[];
}

export default function UnlockConditionModal({
  open,
  onClose,
  target,
  milestones,
  onSave,
  initialSelected,
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
    ms.steps.filter((step) => {
      if (target.type === 'milestone') return ms.id !== target.id;
      if (target.type === 'step') return step.id !== target.id;
      return true;
    }),
  ).length;

  const hasNoData = milestoneCount === 0 && stepCount === 0;

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
                    className={`cursor-pointer rounded-lg border p-3 ${
                      isSelected(ms.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => toggle('milestone', ms.id)}
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
                ms.steps
                  .filter((step) => {
                    if (target.type === 'milestone') return ms.id !== target.id;
                    if (target.type === 'step') return step.id !== target.id;
                    return true;
                  })
                  .map((step) => (
                    <div
                      key={step.id}
                      className={`cursor-pointer rounded-lg border p-3 ${
                        isSelected(step.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => toggle('step', step.id)}
                    >
                      <p className="font-medium">{step.name}</p>
                      <p className="text-xs text-gray-500">
                        {' '}
                        {tSelectedMilestone('unlock-condition.form')}: {ms.name}
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
            className="rounded-lg bg-purple-600 px-4 py-2 text-white"
            onClick={() => onSave(selected)}
          >
            {tSelectedMilestone('unlock-condition.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
