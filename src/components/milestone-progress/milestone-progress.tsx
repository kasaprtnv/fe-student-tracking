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
import { Badge } from '@/components/ui/badge';
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
  Upload,
  ChevronDown,
  Calendar,
  Paperclip,
  Lock,
  Unlock,
  TrendingUp,
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

interface MilestoneProgressProps {
  milestones: IMilestone[];
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

// Utility: แปลง status เป็น completed/isActive
const isStepCompleted = (status: string) => status === 'approved';
const isStepDeclined = (status: string) => status === 'declined';
const isStepPending = (status: string) => status === 'pending';
const isStepAvailable = (status: string) => status === 'available';
const isLocked = (status: string) => status === 'locked';

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  milestones,
  mode = 'readonly',
  onFileUpload,
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

  const [internalFiles, setInternalFiles] = useState<Record<string, File>>({});
  const [internalFileNames, setInternalFileNames] = useState<
    Record<string, string>
  >({});
  const [internalSubmitting, setInternalSubmitting] = useState<
    Record<string, boolean>
  >({});

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);
  const allowedFileTypes = '.pdf,.docx';
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

  const handleFileChange = (
    stepId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setInternalFiles((prev) => ({ ...prev, [stepId]: file }));
      setInternalFileNames((prev) => ({ ...prev, [stepId]: file.name }));

      if (onFileUpload) {
        onFileUpload(stepId, file);
      }
    }
  };

  const openConfirmModal = (stepId: string) => {
    setPendingStepId(stepId);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingStepId) return;

    const stepId = pendingStepId;
    const file = internalFiles[stepId];

    setConfirmModalOpen(false);

    if (!file) {
      console.error('Missing file');
      return;
    }

    setInternalSubmitting((prev) => ({ ...prev, [stepId]: true }));

    try {
      const progressId = stepProgressMap[stepId] || stepId;
      const response = await uploadService.createAttachment(
        progressId,
        file,
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
                <div className="text-primary text-3xl font-bold">
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
            <Progress value={overallProgress} className="h-2" />
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
              <div className="bg-primary absolute top-0 left-0 z-10 flex h-[60px] w-[60px] items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg">
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
                          <div className="text-primary text-2xl font-bold">
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
                    <Progress value={progress} className="mt-3 h-2" />
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
                              declined && 'border-red-200 bg-red-50',
                              pending && 'border-yellow-200 bg-yellow-50',
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

                                  <p className="text-muted-foreground mb-2 text-sm">
                                    {step.description}
                                  </p>

                                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(deadline)}</span>
                                    </div>
                                    {completed && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-700 hover:bg-green-100"
                                      >
                                        ✓ {t('completed')}
                                      </Badge>
                                    )}
                                    {declined && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-700 hover:bg-red-100"
                                      >
                                        X {t('declined')}
                                      </Badge>
                                    )}
                                    {pending && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                      >
                                        <Spinner /> {t('pending')}
                                      </Badge>
                                    )}
                                    {locked && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-muted text-muted-foreground hover:bg-muted"
                                      >
                                        <Lock className="mr-1 h-3 w-3" />
                                        {t('locked')}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Upload Button */}
                                  {mode === 'upload' &&
                                    step.requiresAttachment &&
                                    (available || declined) && (
                                      <div className="mt-3">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={isUploading?.[step.id]}
                                          onClick={() =>
                                            document
                                              .getElementById(`file-${step.id}`)
                                              ?.click()
                                          }
                                        >
                                          {isUploading?.[step.id] ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                          ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                          )}
                                          {isUploading?.[step.id]
                                            ? t('uploading')
                                            : t('upload_button')}
                                        </Button>
                                        <input
                                          id={`file-${step.id}`}
                                          type="file"
                                          accept={allowedFileTypes}
                                          onChange={(e) =>
                                            handleFileChange(step.id, e)
                                          }
                                          className="hidden"
                                        />
                                        <p className="text-muted-foreground mt-1 text-xs">
                                          {t('accept_file_type')}
                                          {' : '}
                                          {allowedFileTypes}
                                        </p>
                                        {(uploadedFiles?.[step.id] ||
                                          internalFileNames[step.id]) && (
                                          <p className="mt-1 text-xs text-green-700">
                                            {t('uploaded_file')}
                                            {' : '}
                                            {uploadedFiles?.[step.id] ||
                                              internalFileNames[step.id]}
                                          </p>
                                        )}
                                        <div className="mt-2 flex justify-end">
                                          <Button
                                            className="bg-green-600 text-white hover:bg-green-700"
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
              className="bg-green-600 hover:bg-green-700"
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
              className="bg-green-600 hover:bg-green-700"
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
