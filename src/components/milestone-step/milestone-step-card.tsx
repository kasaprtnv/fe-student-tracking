'use client';
import React from 'react';
import { IMilestoneStep } from '@/types/milestone-step';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

import {
  Bell,
  Clock,
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { IMilestone } from '@/types/milestone';

interface IMilestoneStepCardProps {
  milestone: IMilestone;
  step: IMilestoneStep;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onEdit: (step: IMilestoneStep) => void;
  onDelete: (step: IMilestoneStep) => void;
}

const MilestoneStepCard = ({
  milestone,
  step,
  dragHandleProps,
  onEdit,
  onDelete,
}: IMilestoneStepCardProps) => {
  const t = useTranslations('milestone-step');
  const tCommon = useTranslations('common');

  return (
    <div className="flex w-full items-center gap-4 rounded-xl border bg-white px-4 py-6 shadow-sm">
      <div
        {...dragHandleProps}
        className="cursor-grab p-2 text-gray-500 select-none hover:text-gray-700"
      >
        <GripVertical size={22} />
      </div>

      {/* Position (เลขลำดับ) */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-red-700 text-sm font-semibold text-white">
        {step.position}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="truncate text-base font-semibold sm:max-w-[400px] lg:max-w-[700px]">
                {step.name}
              </h2>
            </TooltipTrigger>
            {step.name.length > 50 && (
              <TooltipContent className="max-w-md border border-gray-200 bg-white px-4 py-2.5 text-sm break-words text-gray-900 shadow-lg">
                {step.name}
              </TooltipContent>
            )}
          </Tooltip>

          <Badge
            className={cn(
              'px-2 py-0.5 text-xs',
              step.requiresAttachment
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800',
            )}
          >
            {step.requiresAttachment
              ? t('requires-attachment')
              : t('no-attachment-required')}
          </Badge>
        </div>
        {/* Description */}
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="mt-1 truncate text-sm text-gray-600 sm:max-w-[400px] lg:max-w-[700px]">
              {step.description}
            </p>
          </TooltipTrigger>
          {(step?.description?.length ?? 0) > 100 && (
            <TooltipContent className="max-w-md border border-gray-200 bg-white px-4 py-2.5 text-sm break-words text-gray-900 shadow-lg">
              {step.description}
            </TooltipContent>
          )}
        </Tooltip>
        <div className="mt-1 w-fit rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>
                {t('day-period')} {step.dayPeriod} {tCommon('days')}
              </span>
            </div>

            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Bell size={14} />
                <span>
                  {t('first-notify-before-days')} : {step.notifyBeforeDays}{' '}
                  {tCommon('days')}
                </span>
              </div>
            </>
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Bell size={14} />
                <span>
                  {t('second-notify-before-days')} :{' '}
                  {step.secondNotifyBeforeDays} {tCommon('days')}
                </span>
              </div>
            </>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-md p-2 hover:bg-gray-100" variant="ghost">
            <MoreVertical size={18} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => onEdit(step)}
            disabled={milestone?.isUsed}
          >
            <Pencil size={14} />
            {tCommon('edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => onDelete(step)}
            disabled={milestone?.isUsed}
          >
            <Trash2 size={14} color="#e7000b" />
            {tCommon('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MilestoneStepCard;
