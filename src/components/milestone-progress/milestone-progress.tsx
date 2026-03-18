import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  Calendar,
  Paperclip,
  Lock,
  Unlock,
  TrendingUp,
  File,
  Download,
  CircleX,
  CircleCheck,
  Hourglass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { IMilestone, ViewMode } from '@/types/milestone';
import { useLocale, useTranslations } from 'next-intl';
import { Spinner } from '../ui/spinner';
import { uploadService } from '@/services/upload.service';
import { UploadFileDialog } from './upload-file-dialog';
import { StudentStepAttempts } from '@/types/student-step-attempts';
import { studentStepProgressService } from '@/services/student-step-progress.service';
import { UnlockCondition } from '@/types/milestone-prerequisite';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { StepStatus } from '@/types/profile';

interface MilestoneProgressProps {
  milestones: IMilestone[];
  stepAttempts?: StudentStepAttempts[];
  mode?: ViewMode;
  enrollDate?: string;
  onFileUpload?: (stepId: string, file: File) => void;
  onSubmit?: (stepId: string) => void;
  onSubmitSuccess?: (stepId: string) => void;
  onToggleLock?: (id: string, type: 'milestone' | 'step') => void;
  uploadedFiles?: Record<string, string>;
  lockedItems?: Record<string, boolean>;
  isUploading?: Record<string, boolean>;
  isSubmitting?: Record<string, boolean>;
  stepProgressMap?: Record<string, string>;
  userId?: string;
  courseIsUsed?: boolean;
  displayMode?: 'normal' | 'select-milestone';
  lockInfoMap?: Record<string, UnlockCondition[]>;
}

const isStepCompleted = (status: string) => status === 'approved';
const isStepDeclined = (status: string) => status === 'declined';
const isStepPending = (status: string) => status === 'pending approval';
const isStepAvailable = (status: string) => status === 'available';
const isLocked = (status: string) => status === 'locked';

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  milestones,
  mode = 'readonly',
  onFileUpload,
  stepAttempts,
  onSubmit,
  onSubmitSuccess,
  onToggleLock,
  uploadedFiles,
  lockedItems = {},
  enrollDate,
  isUploading,
  isSubmitting,
  stepProgressMap = {},
  userId,
  courseIsUsed = false,
  lockInfoMap = {},
  displayMode = 'normal',
}) => {
  const t = useTranslations('milestone-progress');
  const language = useLocale();
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>(
    () => Object.fromEntries(milestones.map((m) => [m.id, true])),
  );
  const attemptMap = useMemo(() => {
    const map: Record<
      string,
      StudentStepAttempts & {
        staffAttachments?: Array<{
          id: string;
          fileName: string;
          fileKey: string;
        }>;
      }
    > = {};

    stepAttempts?.forEach((attempt) => {
      const stepId = attempt.stepProgress.milestoneStepId;

      // ถ้ายังไม่มี หรือ attemptNo ใหม่มากกว่า ให้เก็บ
      if (!map[stepId] || attempt.attemptNo > map[stepId].attemptNo) {
        map[stepId] = {
          ...attempt,
          staffAttachments: attempt.staffAttachment
            ? [attempt.staffAttachment]
            : [],
        };
      }
      // ถ้า attemptNo เท่ากัน ให้รวม staffAttachment
      else if (
        attempt.attemptNo === map[stepId].attemptNo &&
        attempt.staffAttachment
      ) {
        if (!map[stepId].staffAttachments) {
          map[stepId].staffAttachments = [];
        }
        map[stepId].staffAttachments!.push(attempt.staffAttachment);
      }
    });

    return map;
  }, [stepAttempts]);

  const { milestoneRequiredMap, stepRequiredMap } = useMemo(() => {
    const milestoneMap: Record<
      string,
      {
        steps: { id: string; name: string }[];
        milestones: { id: string; name: string }[];
      }
    > = {};

    const stepMap: Record<
      string,
      {
        steps: { id: string; name: string }[];
        milestones: { id: string; name: string }[];
      }
    > = {};

    milestones.forEach((m) => {
      const milestone =
        m.requiredMilestoneIds?.map((milestoneId) => {
          const foundMilestone = milestones.find((ms) => ms.id === milestoneId);
          return {
            id: milestoneId,
            name: foundMilestone ? foundMilestone.name : milestoneId,
          };
        }) || [];

      const stepsReq =
        m.requiredStepIds?.map((stepId) => {
          for (const ms of milestones) {
            const foundStep = ms.steps?.find((st) => st.id === stepId);
            if (foundStep) {
              return { id: stepId, name: foundStep.name };
            }
          }
          return { id: stepId, name: stepId };
        }) || [];

      milestoneMap[m.id] = {
        steps: stepsReq,
        milestones: milestone,
      };

      m.steps?.forEach((s) => {
        const steps =
          s.requiredStepIds?.map((stepId) => {
            for (const ms of milestones) {
              const foundStep = ms.steps?.find((st) => st.id === stepId);
              if (foundStep) {
                return { id: stepId, name: foundStep.name };
              }
            }
            return { id: stepId, name: stepId };
          }) || [];

        const milestonesReq =
          s.requiredMilestoneIds?.map((milestoneId) => {
            const foundMilestone = milestones.find(
              (ms) => ms.id === milestoneId,
            );
            return {
              id: milestoneId,
              name: foundMilestone ? foundMilestone.name : milestoneId,
            };
          }) || [];

        stepMap[s.id] = {
          steps,
          milestones: milestonesReq,
        };
      });
    });
    return { milestoneRequiredMap: milestoneMap, stepRequiredMap: stepMap };
  }, [milestones]);
  const [internalFiles, setInternalFiles] = useState<Record<string, File[]>>(
    {},
  );
  const [internalFileNames, setInternalFileNames] = useState<
    Record<string, string[]>
  >({});
  const [internalComments, setInternalComments] = useState<
    Record<string, string>
  >({});
  const [internalSubmitting, setInternalSubmitting] = useState<
    Record<string, boolean>
  >({});

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);
  const stepDeadlineMap = useMemo(() => {
    if (!enrollDate) return {};
    const map: Record<string, Date> = {};
    milestones.forEach((milestone) => {
      milestone.steps?.forEach((step) => {
        if (step.deadline) {
          map[step.id] = new Date(step.deadline);
        }
      });
    });
    return map;
  }, [milestones, enrollDate]);

  // Calculate overall progress
  const totalSteps = milestones.reduce(
    (acc, ms) => acc + (ms.steps?.length ?? 0),
    0,
  );
  const completedSteps = milestones.reduce(
    (acc, ms) =>
      acc + (ms.steps?.filter((s) => isStepCompleted(s.status)).length ?? 0),
    0,
  );
  const overallProgress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Calculate milestone progress
  const getMilestoneProgress = (milestone: IMilestone) => {
    const total = milestone.steps?.length ?? 0;
    const completed =
      milestone.steps?.filter((s) => isStepCompleted(s.status)).length ?? 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getConditionName = (condition: UnlockCondition) => {
    if (condition.type === 'milestone') {
      const ms = milestones.find((m) => m.id === condition.id);
      return ms?.name ?? 'Unknown milestone';
    }

    if (condition.type === 'step') {
      for (const ms of milestones) {
        const step = ms.steps?.find((s) => s.id === condition.id);
        if (step) return step.name;
      }
      return 'Unknown step';
    }

    return '';
  };

  const toggleMilestone = (milestoneId: string) => {
    setOpenMilestones((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  const openConfirmModal = (stepId: string) => {
    setPendingStepId(stepId);
    setConfirmModalOpen(true);
  };

  const downloadFile = async (fileKey: string) => {
    const fileUrl = fileKey.startsWith('attachments')
      ? `${process.env.NEXT_PUBLIC_STATIC_URL}/${fileKey}`
      : fileKey;
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error('Network response was not ok');
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
      const filename = match
        ? decodeURIComponent(match[1])
        : fileKey.split('/').pop() || 'download';
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(fileUrl, '_blank');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!pendingStepId) return;
    const stepId = pendingStepId;
    const files = internalFiles[stepId];
    const studentComment = internalComments[stepId];
    setConfirmModalOpen(false);
    if (!files || files.length === 0) {
      const res = await studentStepProgressService.submitForReview(
        stepId,
        userId || '',
        studentComment,
      );
      if (res.success) {
        onSubmitSuccess?.(stepId);
        setInternalComments((prev) => {
          const newComments = { ...prev };
          delete newComments[stepId];
          return newComments;
        });
      }
      onSubmit?.(stepId);
      return res;
    }
    setInternalSubmitting((prev) => ({ ...prev, [stepId]: true }));
    try {
      const progressId = stepProgressMap[stepId] || stepId;

      // ลบไฟล์เก่าก่อน upload ใหม่ (กรณีส่งกลับหลังถูกปฏิเสธ)
      try {
        const existingAttachments =
          await uploadService.getAttachmentsByProgress(progressId);
        // ลบเฉพาะไฟล์ที่ student เป็นคนอัพโหลด
        const studentAttachments = existingAttachments.filter(
          (att) => att.uploadedByUserId === userId,
        );
        for (const att of studentAttachments) {
          if (att.id) {
            await uploadService.deleteAttachment(att.id);
          }
        }
      } catch (deleteError) {
        console.warn('Error deleting old attachments:', deleteError);
        // ไม่ block การ upload ถ้าลบไม่ได้
      }

      const response = await uploadService.createAttachment(
        progressId,
        files,
        userId,
      );
      if (response.success) {
        // บันทึก studentComment หลังอัปโหลดไฟล์สำเร็จ
        if (studentComment) {
          try {
            await studentStepProgressService.submitForReview(
              stepId,
              userId || '',
              studentComment,
            );
          } catch (commentError) {
            console.warn('Error saving student comment:', commentError);
          }
        }
        setSuccessModalOpen(true);
        onSubmitSuccess?.(stepId);
        setInternalFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[stepId];
          return newFiles;
        });
        setInternalFileNames((prev) => {
          const newNames = { ...prev };
          delete newNames[stepId];
          return newNames;
        });
        setInternalComments((prev) => {
          const newComments = { ...prev };
          delete newComments[stepId];
          return newComments;
        });
      } else {
        console.error('Upload failed:', response.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setInternalSubmitting((prev) => ({ ...prev, [stepId]: false }));
      setPendingStepId(null);
    }
    onSubmit?.(stepId);
  };

  const formatDate = (date: Date) => {
    if (date == null) return '-';
    const locale = language === 'th' ? 'th-TH' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const checkRequiredIsCompleted = (milestoneId: string) => {
    let IsAllComplete: boolean = true;
    const required = milestoneRequiredMap[milestoneId];
    if (!required) return true;
    const requiredMilestones = required.milestones || [];
    if (requiredMilestones.length > 0) {
      requiredMilestones.forEach((rm) => {
        const ms = milestones.find((m) => m.id === rm.id);
        ms?.steps?.forEach((s) => {
          if (!isStepCompleted(s.status)) {
            IsAllComplete = false;
          }
        });
      });
    }

    const requiredSteps = required.steps || [];
    if (requiredSteps.length > 0) {
      requiredSteps.forEach((rs) => {
        for (const ms of milestones) {
          const step = ms.steps?.find((s) => s.id === rs.id);
          if (step && !isStepCompleted(step.status)) {
            IsAllComplete = false;
          }
        }
      });
    }
    return IsAllComplete;
  };

  const getUnlockMessage = (
    requiredMilestones: { id: string; name: string }[],
    requiredSteps: { id: string; name: string }[],
    currentName: string,
    milestoneOrStep: 'milestone' | 'step',
    t: (key: string) => string,
  ) => {
    // กรณีไม่มีเงื่อนไข
    if (requiredMilestones.length === 0 && requiredSteps.length === 0) {
      return t('locked');
    }

    const messages: string[] = [];

    // เงื่อนไขสำหรับ milestone
    if (requiredMilestones.length > 0) {
      const milestoneNames = requiredMilestones
        .map((m) => `"${m.name}"`)
        .join(', ')
        .replace(/, ([^,]*)$/, ' และ $1');

      messages.push(`${t('need_to_complete_milestone')} ${milestoneNames}`);
    }

    // เงื่อนไขสำหรับ step
    if (requiredSteps.length > 0) {
      const stepNames = requiredSteps
        .map((s) => `"${s.name}"`)
        .join(', ')
        .replace(/, ([^,]*)$/, ` ${t('and')} $1`);

      const prefix =
        requiredMilestones.length > 0
          ? `${t('prefix_milestone')}`
          : `${t('need_to_complete_step')}`;

      messages.push(`${prefix} ${stepNames}`);
    }

    return messages;
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Progress Card */}
      {mode !== 'edit' && (
        <Card>
          <CardContent className="px-8 py-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary h-5 w-5" />
                <span className="font-semibold">{t('overall_progress')}</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-800">
                  {overallProgress}%
                </div>
                <div className="text-muted-foreground text-xs">
                  {t('progress_count', {
                    completed: completedSteps,
                    total: totalSteps,
                  })}
                </div>
              </div>
            </div>
            <Progress
              value={overallProgress}
              className="h-2 [&>div]:bg-red-800"
            />
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <div className="relative space-y-6">
        {milestones.map((milestone, index) => {
          const milestoneLocked = lockedItems[milestone.id];
          const progress = getMilestoneProgress(milestone);
          const isOpen = openMilestones[milestone.id] ?? true;
          const isLastMilestone = index === milestones.length - 1;

          return (
            <div key={milestone.id} className="relative">
              {!isLastMilestone && (
                <div className="bg-border absolute top-[60px] left-[30px] h-[calc(100%+24px)] w-0.5" />
              )}

              {/* Milestone Number Badge */}
              <div className="absolute top-0 left-0 z-10 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-red-800 text-xl font-bold text-white shadow-lg">
                {index + 1}
              </div>

              <Card className="ml-20 border-2">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleMilestone(milestone.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <CardTitle className="text-xl">
                            {milestone.name}
                          </CardTitle>
                          {mode === 'edit' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={courseIsUsed}
                                      className={`h-8 w-8 ${
                                        milestoneLocked
                                          ? 'bg-red-300 text-red-500'
                                          : ''
                                      }`}
                                      onClick={() =>
                                        onToggleLock?.(
                                          milestone.id,
                                          'milestone',
                                        )
                                      }
                                    >
                                      {milestoneLocked ? (
                                        <Lock className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <Unlock className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </span>
                                </TooltipTrigger>

                                {lockInfoMap?.[milestone.id]?.length > 0 && (
                                  <TooltipContent className="max-w-xs">
                                    <div className="space-y-1">
                                      <div className="font-semibold">
                                        {t('unlock_conditions')}
                                      </div>

                                      {lockInfoMap[milestone.id].map((c) => (
                                        <div key={c.id} className="text-xs">
                                          • {getConditionName(c)}{' '}
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <CardDescription>
                          {milestone.description}
                        </CardDescription>
                        {!checkRequiredIsCompleted(milestone.id) &&
                          (milestoneRequiredMap[milestone.id]?.milestones
                            ?.length > 0 ||
                            milestoneRequiredMap[milestone.id]?.steps?.length >
                              0) && (
                            <div className="mt-2 flex w-fit items-center gap-2 rounded-md bg-gray-100 px-4 py-2">
                              <Lock className="h-4 w-4 text-gray-600" />
                              <p className="text-sm text-gray-700">
                                {getUnlockMessage(
                                  milestoneRequiredMap[milestone.id]
                                    ?.milestones || [],
                                  milestoneRequiredMap[milestone.id]?.steps ||
                                    [],
                                  milestone.name,
                                  'milestone',
                                  t,
                                )}
                              </p>
                            </div>
                          )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-800">
                            {progress}%
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {milestone.steps?.filter((s) =>
                              isStepCompleted(s.status),
                            ).length ?? 0}
                            /{milestone.steps?.length ?? 0}
                          </div>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown
                              className={cn(
                                'h-5 w-5 transition-transform',
                                isOpen && 'rotate-180 transform',
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <Progress
                      value={progress}
                      className="mt-3 h-2 [&>div]:bg-red-800"
                    />
                  </CardHeader>

                  <CollapsibleContent className="mt-6">
                    <CardContent className="space-y-3">
                      {milestone.steps?.map((step) => {
                        const deadline = stepDeadlineMap[step.id];
                        const stepLocked = lockedItems[step.id];
                        const completed = isStepCompleted(step.status);
                        const declined = isStepDeclined(step.status);
                        const pending = isStepPending(step.status);
                        const available = isStepAvailable(step.status);
                        const locked = isLocked(step.status);

                        return (
                          <Card
                            key={step.id}
                            className={cn(
                              'border-2 transition-colors',
                              completed && 'border-green-200',
                              declined && 'border-red-200',
                              pending && 'border-yellow-200',
                              locked &&
                                'border-muted bg-muted text-muted-foreground opacity-70',
                            )}
                          >
                            <CardContent>
                              <div className="flex items-start gap-3">
                                {/* Step Number */}
                                <div
                                  className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
                                    completed
                                      ? 'bg-green-500 text-white'
                                      : declined
                                        ? 'bg-red-500 text-white'
                                        : pending
                                          ? 'bg-yellow-500 text-white'
                                          : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {step.position}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    {completed ? (
                                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                                    ) : declined ? (
                                      <Circle className="h-5 w-5 shrink-0 text-red-500" />
                                    ) : pending ? (
                                      <Circle className="h-5 w-5 shrink-0 text-yellow-500" />
                                    ) : (
                                      <Circle className="text-muted-foreground h-5 w-5 shrink-0" />
                                    )}
                                    <h4 className="font-semibold">
                                      {step.name}
                                    </h4>
                                    {step.requiresAttachment && (
                                      <Paperclip className="text-muted-foreground h-4 w-4" />
                                    )}
                                    {mode === 'edit' && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={courseIsUsed}
                                                className={`ml-auto h-6 w-6 ${
                                                  stepLocked
                                                    ? 'bg-red-300 text-red-500'
                                                    : ''
                                                }`}
                                                onClick={() =>
                                                  onToggleLock?.(
                                                    step.id,
                                                    'step',
                                                  )
                                                }
                                              >
                                                {stepLocked ? (
                                                  <Lock className="h-3 w-3 text-red-500" />
                                                ) : (
                                                  <Unlock className="h-3 w-3" />
                                                )}
                                              </Button>
                                            </span>
                                          </TooltipTrigger>

                                          {lockInfoMap?.[step.id]?.length >
                                            0 && (
                                            <TooltipContent className="max-w-xs">
                                              <div className="space-y-1">
                                                <div className="font-semibold">
                                                  {t('unlock_conditions')}
                                                </div>

                                                {lockInfoMap[step.id].map(
                                                  (c) => (
                                                    <div
                                                      key={c.id}
                                                      className="text-xs"
                                                    >
                                                      •{' '}
                                                      {getConditionName(c)}{' '}
                                                    </div>
                                                  ),
                                                )}
                                              </div>
                                            </TooltipContent>
                                          )}
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>

                                  <div className="mb-2 flex flex-row items-center gap-6">
                                    {step.description && (
                                      <p className="text-muted-foreground text-sm">
                                        {step.description}
                                      </p>
                                    )}
                                    {/* Upload Button */}
                                    {mode === 'upload' &&
                                      step.requiresAttachment &&
                                      (available || declined) && (
                                        <div>
                                          <UploadFileDialog
                                            step={step}
                                            isUploading={isUploading}
                                            onFileUpload={(stepId, files) => {
                                              const filesToSet = Array.isArray(
                                                files,
                                              )
                                                ? files
                                                : [files];
                                              setInternalFiles((prev) => ({
                                                ...prev,
                                                [stepId]: filesToSet,
                                              }));
                                              setInternalFileNames((prev) => ({
                                                ...prev,
                                                [stepId]: filesToSet.map(
                                                  (f) => f.name,
                                                ),
                                              }));
                                              onFileUpload?.(
                                                stepId,
                                                filesToSet[0],
                                              );
                                            }}
                                          />
                                        </div>
                                      )}
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                    {displayMode === 'select-milestone' ? (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-3 w-3" />
                                          {t('dayperiod')} :
                                          <span>
                                            {step.dayPeriod} {t('day')}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {t('NotifyBefore')} :
                                          <span>
                                            {step.notifyBeforeDays} {t('day')}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span className="mr-1">
                                          {t('deadline_date')} :
                                        </span>
                                        <span>{formatDate(deadline)}</span>
                                      </div>
                                    )}
                                    {completed && (
                                      <>
                                        <div className="flex items-center gap-1.5">
                                          <CircleCheck className="size-5 text-green-600" />
                                          <span className="text-lg text-green-600">
                                            {t('completed')}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    {declined && (
                                      <>
                                        <div className="flex items-center gap-1.5">
                                          <CircleX className="size-5 text-red-600" />
                                          <span className="text-lg text-red-600">
                                            {t('declined')}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    {pending && (
                                      <>
                                        <div className="flex items-center gap-1.5">
                                          <Hourglass className="size-5 text-yellow-400" />
                                          <span className="text-lg text-yellow-400">
                                            {t('pending')}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    {locked && (
                                      <>
                                        <div className="flex items-center gap-1.5">
                                          <Lock className="size-5 text-gray-600" />
                                          <span className="text-md text-gray-600">
                                            {getUnlockMessage(
                                              stepRequiredMap[step.id]
                                                ?.milestones || [],
                                              stepRequiredMap[step.id]?.steps ||
                                                [],
                                              step.name,
                                              'step',
                                              t,
                                            )}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    {/* Attachment Preview */}
                                    {attemptMap[step.id] &&
                                      (completed || declined) && (
                                        <>
                                          {(attemptMap[step.id].staffAttachments
                                            ?.length || 0) > 0 && (
                                            <>
                                              <div className="mt-3 font-bold">
                                                {t('file_attachment')}
                                              </div>
                                              {attemptMap[
                                                step.id
                                              ].staffAttachments?.map(
                                                (attachment, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="mt-3 flex w-1/2 rounded-2xl border p-4 py-4"
                                                  >
                                                    <File className="mr-2" />
                                                    {attachment.fileName}
                                                    <div className="ml-auto">
                                                      <Download
                                                        className="hover:cursor-pointer"
                                                        onClick={() =>
                                                          downloadFile(
                                                            attachment.fileKey,
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </>
                                          )}
                                        </>
                                      )}
                                    {attemptMap[step.id] &&
                                      attemptMap[step.id].staffComment != '' &&
                                      attemptMap[step.id].staffComment !=
                                        null &&
                                      declined && (
                                        <>
                                          <div className="mt-3 font-bold text-red-500">
                                            {t('reason_for_decline')}
                                          </div>
                                          <div className="mt-3 h-24 w-1/2 rounded-2xl border p-4">
                                            {attemptMap[step.id].staffComment}
                                          </div>
                                        </>
                                      )}
                                    {attemptMap[step.id] &&
                                      completed &&
                                      attemptMap[step.id].staffComment != '' &&
                                      attemptMap[step.id].staffComment !=
                                        null && (
                                        <>
                                          <div className="mt-3 font-bold">
                                            {t('recommendation')}
                                          </div>
                                          <div className="mt-3 h-24 w-1/2 rounded-2xl border border-gray-300 p-4">
                                            {attemptMap[step.id].staffComment}
                                          </div>
                                        </>
                                      )}
                                    {displayMode !== 'select-milestone' &&
                                      attemptMap[step.id] &&
                                      (attemptMap[step.id].staffAttachment ||
                                        (attemptMap[step.id].staffComment !=
                                          '' &&
                                          attemptMap[step.id].staffComment !=
                                            null)) &&
                                      declined && (
                                        <Separator className="my-6" />
                                      )}
                                    {/* List file Upload */}
                                    {(available || declined) &&
                                      internalFileNames[step.id] && (
                                        <>
                                          <div className="mt-3 font-bold">
                                            {t('student_file_attachment')}
                                          </div>
                                          {internalFileNames[step.id]?.map(
                                            (name, idx) => (
                                              <div
                                                className="mt-3 flex w-1/2 rounded-2xl border p-4 py-4"
                                                key={idx}
                                              >
                                                <File className="mr-2" />
                                                <span
                                                  className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:underline"
                                                  onClick={() => {
                                                    const file =
                                                      internalFiles[step.id]?.[
                                                        idx
                                                      ];
                                                    if (file) {
                                                      const url =
                                                        URL.createObjectURL(
                                                          file,
                                                        );
                                                      window.open(
                                                        url,
                                                        '_blank',
                                                      );
                                                    }
                                                  }}
                                                >
                                                  {name}
                                                </span>
                                              </div>
                                            ),
                                          )}
                                        </>
                                      )}
                                    {displayMode !== 'select-milestone' &&
                                      mode === 'upload' &&
                                      (available || declined) && (
                                        <div>
                                          <div className="mt-3 font-bold">
                                            {t('description')}
                                          </div>
                                          <Textarea
                                            className="mt-3 h-24 w-1/2 resize-none rounded-2xl border"
                                            value={
                                              internalComments[step.id] || ''
                                            }
                                            onChange={(e) =>
                                              setInternalComments((prev) => ({
                                                ...prev,
                                                [step.id]: e.target.value,
                                              }))
                                            }
                                            placeholder={t(
                                              'description_placeholder',
                                            )}
                                          />
                                        </div>
                                      )}
                                  </div>
                                  {mode === 'upload' &&
                                    (available || declined) &&
                                    step.requiresAttachment && (
                                      <div className="mt-2 flex justify-end">
                                        <Button
                                          className="text-white"
                                          disabled={
                                            (!uploadedFiles?.[step.id] &&
                                              !internalFiles[step.id]) ||
                                            isSubmitting?.[step.id] ||
                                            internalSubmitting[step.id]
                                          }
                                          onClick={() =>
                                            openConfirmModal(step.id)
                                          }
                                        >
                                          {isSubmitting?.[step.id] ||
                                          internalSubmitting[step.id] ? (
                                            <>
                                              <Spinner className="mr-2 h-4 w-4" />
                                              {t('submitting')}
                                            </>
                                          ) : (
                                            t('submit_button')
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  {mode === 'upload' &&
                                    (available || declined) &&
                                    !step.requiresAttachment && (
                                      <div className="mt-2 flex justify-end">
                                        <Button
                                          className="text-white"
                                          onClick={() =>
                                            openConfirmModal(step.id)
                                          }
                                        >
                                          {t('submit_button')}
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_submit_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_submit_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-black hover:bg-black"
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <AlertDialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {t('submit_success_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('submit_success_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setSuccessModalOpen(false)}
              className="bg-black hover:bg-black"
            >
              {t('ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MilestoneProgress;
