'use client';

import React, { useState, useEffect } from 'react';
import type { Milestone } from '@/types/milestone';

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
}

export default function UnlockConditionModal({
  open,
  onClose,
  target,
  milestones,
  onSave,
}: UnlockConditionModalProps) {
  const [selected, setSelected] = useState<UnlockCondition[]>(() => []);

  if (!open || !target) return null;

  const toggle = (type: 'milestone' | 'step', id: string) => {
    setSelected((prev) =>
      prev.some((x) => x.id === id)
        ? prev.filter((x) => x.id !== id)
        : [...prev, { type, id }],
    );
  };

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-h-[85vh] w-[500px] overflow-auto rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">ตั้งค่าเงื่อนไข Unlock</h2>
        {/* Milestones */}
        <h3 className="mb-2 text-sm font-medium">Milestone ทั้งหมด</h3>
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
                <p className="text-xs text-gray-500">
                  ต้องทำ Step ทั้งหมดของ milestone นี้
                </p>
              </div>
            ))}
        </div>
        <h3 className="mb-2 text-sm font-medium">Step เฉพาะ</h3>
        <div className="space-y-2">
          {milestones.map((ms) =>
            ms.steps
              .filter((step) => {
                if (target.type === 'milestone') {
                  return ms.id !== target.id;
                }

                if (target.type === 'step') {
                  return step.id !== target.id;
                }

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
                  <p className="text-xs text-gray-500">จาก: {ms.name}</p>
                </div>
              )),
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-lg border px-4 py-2" onClick={onClose}>
            ยกเลิก
          </button>

          <button
            className="rounded-lg bg-purple-600 px-4 py-2 text-white"
            onClick={() => onSave(selected)}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
