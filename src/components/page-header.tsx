'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { House } from 'lucide-react';
import React from 'react';

// Define the shape of each breadcrumb item
export interface BreadcrumbItemType {
  label: string;
  href?: string;
  isPage?: boolean;
}

// Props for the reusable BaseHeader
export interface BaseHeaderProps {
  breadcrumbs: BreadcrumbItemType[];
}

export const PageHeader = ({ breadcrumbs }: BaseHeaderProps) => {
  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                {' '}
                <House size={16} />
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem key={index}>
                {breadcrumb.isPage ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : breadcrumb.href ? (
                  <BreadcrumbLink href={breadcrumb.href}>
                    {breadcrumb.label}
                  </BreadcrumbLink>
                ) : (
                  <span>{breadcrumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};
