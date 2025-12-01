// milestonestep.ts
import { z } from 'zod';
import {
  IMilestoneStep,
  IMilestoneStepCreateDTO,
  IMilestoneStepUpdateDTO,
} from '@/types/milestone-step';

// ----------------------------------------------------
// ZOD SCHEMA (เหมือน milestone.ts แบบปรับ field)
// ----------------------------------------------------

export const milestoneStepSchema = z.object({
  milestoneId: z.string().uuid(),
  parentStepId: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Step name is required'),
  description: z.string().optional().nullable(),

  position: z.number().min(1),

  requiresAttachment: z.boolean().default(false),
  allowedFileTypes: z.string().optional().nullable(),

  deadlineDate: z.date().optional().nullable(),
  notifyBeforeDays: z.number().optional().nullable(),

  isActive: z.boolean().default(true),
});

// ----------------------------------------------------
// DEFAULT FORM VALUES
// ----------------------------------------------------
export const getDefaultMilestoneStepForm = (
  milestoneId?: string,
): IMilestoneStepCreateDTO => ({
  milestoneId: milestoneId ?? '',
  name: '',
  description: '',
  position: 1,
  requiresAttachment: false,
  notifyBeforeDays: 0,
  isActive: true,
});

// ----------------------------------------------------
// FORMATTER: แปลงข้อมูลสำหรับแสดงผล
// ----------------------------------------------------
export const formatMilestoneStep = (step: IMilestoneStep) => ({
  ...step,
  createdAt: new Date(step.createdAt),
  updatedAt: new Date(step.updatedAt),
});

// ----------------------------------------------------
// BUILDER: ใช้ก่อนส่งเข้า API (Create)
// ----------------------------------------------------
export const buildMilestoneStepCreate = (
  form: IMilestoneStepCreateDTO,
): IMilestoneStepCreateDTO => ({
  milestoneId: form.milestoneId,
  name: form.name,
  description: form.description,
  position: form.position,
  requiresAttachment: form.requiresAttachment,
  notifyBeforeDays: form.notifyBeforeDays,
  isActive: form.isActive ?? true,
});

// ----------------------------------------------------
// BUILDER: ใช้ก่อนส่งเข้า API (Update)
// ----------------------------------------------------
export const buildMilestoneStepUpdate = (
  form: IMilestoneStepUpdateDTO,
): IMilestoneStepUpdateDTO => ({
  ...form,
  parentStepId: form.parentStepId ?? null,
  description: form.description ?? null,
  allowedFileTypes: form.allowedFileTypes ?? null,
  deadlineDate: form.deadlineDate ?? null,
  notifyBeforeDays: form.notifyBeforeDays ?? null,
});

// ----------------------------------------------------
// DROPDOWN LABEL FORMATTER
// ----------------------------------------------------
export const getMilestoneStepLabel = (step: IMilestoneStep) => {
  const base = step.name;
  return base.length > 30 ? base.substring(0, 30) + '...' : base;
};

// ----------------------------------------------------
// SORT HELPER
// ----------------------------------------------------
export const sortStepsByPosition = (steps: IMilestoneStep[]) => {
  return [...steps].sort((a, b) => a.position - b.position);
};

// ----------------------------------------------------
// GROUP BY MILESTONE ID
// ----------------------------------------------------
export const groupStepsByMilestone = (steps: IMilestoneStep[]) => {
  const grouped: Record<string, IMilestoneStep[]> = {};
  steps.forEach((s) => {
    if (!grouped[s.milestoneId]) grouped[s.milestoneId] = [];
    grouped[s.milestoneId].push(s);
  });
  return grouped;
};
