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
}) => {
  const t = useTranslations('milestone-progress');
  const language = useLocale();
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>(
    () => Object.fromEntries(milestones.map((m) => [m.id, true])),
  );
  const attemptMap = useMemo(() => {
    const map: Record<string, StudentStepAttempts> = {};
    stepAttempts?.forEach((attempt) => {
      const stepId = attempt.stepProgress.mileStoneStepId;
      if (!map[stepId] || attempt.attemptNo > map[stepId].attemptNo) {
        map[stepId] = attempt;
      }
    });
    return map;
  }, [stepAttempts]);

  const [internalFiles, setInternalFiles] = useState<Record<string, File[]>>(
    {},
  );
  const [internalFileNames, setInternalFileNames] = useState<
    Record<string, string[]>
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
    let lastDeadline = new Date(enrollDate);

    milestones.forEach((milestone) => {
      milestone.steps?.forEach((step) => {
        const deadlineDate = new Date(lastDeadline);
        deadlineDate.setDate(deadlineDate.getDate() + step.dayPeriod);
        map[step.id] = deadlineDate;
        lastDeadline = deadlineDate;
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
    setConfirmModalOpen(false);
    if (!files || files.length === 0) {
      const res = await studentStepProgressService.submitForReview(
        stepId,
        userId || '',
      );
      if (res.success) {
        onSubmitSuccess?.(stepId);
      }
      onSubmit?.(stepId);
      return res;
    }
    setInternalSubmitting((prev) => ({ ...prev, [stepId]: true }));
    try {
      const progressId = stepProgressMap[stepId] || stepId;
      const response = await uploadService.createAttachment(
        progressId,
        files,
        userId,
      );
      if (response.success) {
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
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Progress Card */}
      {mode !== 'edit' && (
        <Card>
          <CardContent className="p-6">
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${milestoneLocked ? 'bg-red-300 text-red-500' : ''}`}
                              onClick={() =>
                                onToggleLock?.(milestone.id, 'milestone')
                              }
                            >
                              {milestoneLocked ? (
                                <Lock className="h-4 w-4 text-red-500" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <CardDescription>
                          {milestone.description}
                        </CardDescription>
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
                              completed && 'border-green-200 bg-green-50',
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
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`ml-auto h-6 w-6 ${stepLocked ? 'bg-red-300 text-red-500' : ''}`}
                                        onClick={() =>
                                          onToggleLock?.(step.id, 'step')
                                        }
                                      >
                                        {stepLocked ? (
                                          <Lock className="h-3 w-3 text-red-500" />
                                        ) : (
                                          <Unlock className="h-3 w-3" />
                                        )}
                                      </Button>
                                    )}
                                  </div>

                                  <div className="mb-2 flex flex-row items-center gap-6">
                                    <p className="text-muted-foreground text-sm">
                                      {step.description}
                                    </p>
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
                                          {/* {internalFileNames[step.id] && (
                                            <span className="ml-2 text-sm text-green-600">
                                              ✓ {internalFileNames[step.id]}
                                            </span>
                                          )} */}
                                        </div>
                                      )}
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(deadline)}</span>
                                    </div>
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
                                          <Spinner className="size-5 text-yellow-400" />
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
                                          <span className="text-lg text-gray-600">
                                            {t('locked')}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    {/* Attachment Preview */}
                                    {attemptMap[step.id] && declined && (
                                      <>
                                        {attemptMap[step.id]
                                          .staffAttachment && (
                                          <>
                                            <div className="mt-3 font-bold">
                                              {t('file_attachment')}
                                            </div>
                                            <div className="mt-3 flex w-1/2 rounded-2xl border p-4 py-4">
                                              <File className="mr-2" />
                                              {
                                                attemptMap[step.id]
                                                  .staffAttachment?.fileName
                                              }
                                              <div className="ml-auto">
                                                <Download
                                                  className="hover:cursor-pointer"
                                                  onClick={() =>
                                                    downloadFile(
                                                      attemptMap[step.id]
                                                        .staffAttachment
                                                        ?.fileKey || '',
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </>
                                        )}
                                        <div className="mt-3 font-bold text-red-500">
                                          {t('reason_for_decline')}
                                        </div>
                                        <div className="mt-3 h-24 w-1/2 rounded-2xl border p-4">
                                          {attemptMap[step.id].staffComment}
                                        </div>
                                      </>
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
