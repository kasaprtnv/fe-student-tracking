import React from 'react';
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
  CheckCircle2,
  Circle,
  Upload,
  ChevronDown,
  Calendar,
  Paperclip,
  Lock,
  Unlock,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Milestone } from '@/types/milestone';

type ViewMode = 'readonly' | 'upload' | 'edit';

interface MilestoneProgressProps {
  milestones: Milestone[];
  mode?: ViewMode;
  onFileUpload?: (stepId: string, file: File) => void;
  onToggleLock?: (id: string, type: 'milestone' | 'step') => void;
  uploadedFiles?: Record<string, string>;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  milestones,
  mode = 'readonly',
  onFileUpload,
  onToggleLock,
  uploadedFiles,
}) => {
  const [openMilestones, setOpenMilestones] = React.useState<
    Record<string, boolean>
  >({});

  // Calculate overall progress
  const totalSteps = milestones.reduce((acc, ms) => acc + ms.steps.length, 0);
  const completedSteps = milestones.reduce(
    (acc, ms) => acc + ms.steps.filter((s) => s.completed).length,
    0,
  );
  const overallProgress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Calculate milestone progress
  const getMilestoneProgress = (milestone: Milestone) => {
    const total = milestone.steps.length;
    const completed = milestone.steps.filter((s) => s.completed).length;
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
    if (file && onFileUpload) {
      onFileUpload(stepId, file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              <span className="font-semibold">Overall Progress</span>
            </div>
            <div className="text-right">
              <div className="text-primary text-3xl font-bold">
                {overallProgress}%
              </div>
              <div className="text-muted-foreground text-xs">
                {completedSteps} of {totalSteps} completed
              </div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="relative space-y-6">
        {milestones.map((milestone, index) => {
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
                              className="h-8 w-8"
                              onClick={() =>
                                onToggleLock?.(milestone.id, 'milestone')
                              }
                            >
                              <Settings className="h-4 w-4" />
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
                            {milestone.steps.filter((s) => s.completed).length}/
                            {milestone.steps.length}
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
                      {milestone.steps.map((step) => (
                        <Card
                          key={step.id}
                          className={cn(
                            'border-2 transition-colors',
                            step.completed && 'border-green-200 bg-green-50',
                            !step.isActive && 'opacity-50',
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Step Number */}
                              <div
                                className={cn(
                                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
                                  step.completed
                                    ? 'bg-green-500 text-white'
                                    : 'bg-muted text-muted-foreground',
                                )}
                              >
                                {step.position}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                                  ) : (
                                    <Circle className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                                  )}
                                  <h4 className="font-semibold">{step.name}</h4>
                                  {step.requiresAttachment && (
                                    <Paperclip className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {mode === 'edit' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="ml-auto h-6 w-6"
                                      onClick={() =>
                                        onToggleLock?.(step.id, 'step')
                                      }
                                    >
                                      {step.isActive ? (
                                        <Unlock className="h-3 w-3" />
                                      ) : (
                                        <Lock className="h-3 w-3" />
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
                                    <span>{formatDate(step.deadlineDate)}</span>
                                  </div>
                                  {step.completed && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-100 text-green-700 hover:bg-green-100"
                                    >
                                      ✓ Completed
                                    </Badge>
                                  )}
                                </div>

                                {/* Upload Button */}
                                {mode === 'upload' &&
                                  step.requiresAttachment &&
                                  !step.completed &&
                                  step.isActive && (
                                    <div className="mt-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                          document
                                            .getElementById(`file-${step.id}`)
                                            ?.click()
                                        }
                                      >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload File
                                      </Button>
                                      <input
                                        id={`file-${step.id}`}
                                        type="file"
                                        accept={step.allowedFileTypes}
                                        onChange={(e) =>
                                          handleFileChange(step.id, e)
                                        }
                                        className="hidden"
                                      />
                                      {step.allowedFileTypes && (
                                        <p className="text-muted-foreground mt-1 text-xs">
                                          Accepted: {step.allowedFileTypes}
                                        </p>
                                      )}

                                      {uploadedFiles?.[step.id] && (
                                        <p className="mt-1 text-xs text-green-700">
                                          อัปโหลดแล้ว: {uploadedFiles[step.id]}
                                        </p>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneProgress;
