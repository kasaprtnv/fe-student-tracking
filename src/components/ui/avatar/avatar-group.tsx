import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AvatarProps = React.ComponentProps<typeof Avatar>;

interface AvatarGroupProps extends React.ComponentProps<'div'> {
  children: React.ReactElement<AvatarProps>[];
  max?: number;
}

export const AvatarGroup = ({
  children,
  max,
  className,
  ...props
}: AvatarGroupProps) => {
  const totalAvatars = React.Children.count(children);
  const displayedAvatars = React.Children.toArray(children)
    .slice(0, max)
    .reverse();
  const remainingAvatars = max && totalAvatars > max ? totalAvatars - max : 0;

  return (
    <div
      className={cn('flex flex-row-reverse items-center', className)} // ใช้ flex-row เพื่อจัดเรียงจากซ้ายไปขวา
      {...props}
    >
      {remainingAvatars > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <Avatar className="ring-background relative -ml-2 ring-2 hover:z-10">
              <AvatarFallback className="bg-muted-foreground text-white">
                +{remainingAvatars}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <span>
              {React.Children.toArray(children)
                .slice(max)
                .map((child) => {
                  if (!React.isValidElement(child)) return null;
                  const { title } = child.props as AvatarProps;
                  return title;
                })
                .join(', ')}
            </span>
          </TooltipContent>
        </Tooltip>
      )}
      {displayedAvatars.map((avatar, index) => {
        if (!React.isValidElement(avatar)) return null;

        const { title } = avatar.props as AvatarProps;

        return (
          <Tooltip key={index}>
            <TooltipTrigger>
              <div className="relative -ml-2 hover:z-10">
                {React.cloneElement(avatar as React.ReactElement<AvatarProps>, {
                  className: 'ring-2 ring-background',
                  title: undefined,
                })}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span>{title}</span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
