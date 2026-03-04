'use client';
import React, { useMemo, useRef } from 'react';
import { useCourse } from '@/hooks/use-course';
import { useMilestone } from '@/hooks/use-milestone';
import { SelectOption } from '@/types';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/combobox-multi';
import { Button } from '@/components/ui/button';
import { IStepProgressReportFilter } from '@/types/step-progress-report';
import { IMilestone } from '@/types/milestone';
import { Filter, Table } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FilterStepProgressReportFormProps {
  yearOptions: SelectOption[];
  degreeOptions: SelectOption[];
  statusOptions: SelectOption[];
  onApplyFilter?: (
    data: IStepProgressReportFilter,
    filterSummary: { label: string; value: string }[],
  ) => void;
  onExportExcel?: () => void;
}

export function FilterStepProgressReportForm({
  yearOptions,
  degreeOptions,
  statusOptions,
  onApplyFilter,
  onExportExcel,
}: FilterStepProgressReportFormProps) {
  const t = useTranslations('step-progress-report.filter-form');
  const { courseMap, allCourseId } = useCourse();
  const { fetchMilestonesByCourse } = useMilestone();

  const form = useForm<IStepProgressReportFilter>({
    defaultValues: {
      stepIds: [],
      milestoneIds: [],
      courseIds: [],
      years: [],
      degrees: [],
      statuses: [],
      major: '',
    },
  });

  const [allMilestoneData, setAllMilestoneData] = React.useState<IMilestone[]>(
    [],
  );
  const [milestoneOptions, setMilestoneOptions] = React.useState<
    SelectOption[]
  >([]);
  const [stepOptions, setStepOptions] = React.useState<SelectOption[]>([]);
  const [isSubmit, setIsSubmit] = React.useState<boolean>(false);

  const selectedCourseIds = useWatch({
    control: form.control,
    name: 'courseIds',
  });
  const selectedMilestoneIds = useWatch({
    control: form.control,
    name: 'milestoneIds',
  });

  const courseOptions = useMemo(
    () =>
      (allCourseId ?? []).map((id) => ({
        label: courseMap[id]?.name ?? '',
        value: courseMap[id]?.id ?? '',
      })),
    [allCourseId, courseMap],
  );

  // เพิ่ม useRef เพื่อเก็บค่า previous
  const prevCourseIds = useRef<string[]>([]);
  const prevMilestoneIds = useRef<string[]>([]);

  // เมื่อ Course เปลี่ยน: Fetch Milestone และ เคลียร์ค่า Milestone/Step
  React.useEffect(() => {
    const updateMilestones = async () => {
      if (selectedCourseIds && selectedCourseIds.length > 0) {
        try {
          const results = await Promise.all(
            selectedCourseIds.map((id) => fetchMilestonesByCourse(id)),
          );
          const flatMilestones = results.flatMap((r) => r.data);

          const uniqMilestonesMap: Record<string, IMilestone> = {};
          flatMilestones.forEach((milestone) => {
            uniqMilestonesMap[milestone.id] = milestone;
          });

          setAllMilestoneData(Object.values(uniqMilestonesMap));
          setMilestoneOptions(
            Object.values(uniqMilestonesMap).map((m) => ({
              label: m.name,
              value: m.id,
            })),
          );
        } catch (error) {
          console.error('Failed to fetch milestones', error);
        }
      } else {
        setAllMilestoneData([]);
        setMilestoneOptions([]);
      }

      // เช็คว่า courseIds เปลี่ยนจริงหรือไม่
      if (
        JSON.stringify(prevCourseIds.current) !==
        JSON.stringify(selectedCourseIds)
      ) {
        form.setValue('milestoneIds', []);
        form.setValue('stepIds', []);
        prevCourseIds.current = selectedCourseIds ? [...selectedCourseIds] : [];
      }
    };

    updateMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseIds, fetchMilestonesByCourse]);

  // เมื่อ Milestone เปลี่ยน: กรอง Steps และ เคลียร์ค่า Step
  React.useEffect(() => {
    if (selectedMilestoneIds && selectedMilestoneIds.length > 0) {
      const filteredSteps = allMilestoneData
        .filter((m) => selectedMilestoneIds.includes(m.id))
        .flatMap((m) => m.steps || [])
        .map((s) => ({
          label: s.name,
          value: s.id,
        }));

      setStepOptions(filteredSteps);
    } else {
      setStepOptions([]);
    }

    // เช็คว่า milestoneIds เปลี่ยนจริงหรือไม่
    if (
      JSON.stringify(prevMilestoneIds.current) !==
      JSON.stringify(selectedMilestoneIds)
    ) {
      form.setValue('stepIds', []);
      prevMilestoneIds.current = selectedMilestoneIds
        ? [...selectedMilestoneIds]
        : [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMilestoneIds, allMilestoneData]);

  const resolveLabels = (
    ids: string[] | undefined,
    options: SelectOption[],
  ): string => {
    if (!ids || ids.length === 0) return t('all');
    return (
      options
        .filter((o) => ids.includes(o.value))
        .map((o) => o.label)
        .join(', ') || t('all')
    );
  };

  const onSubmit = (data: IStepProgressReportFilter) => {
    const summary = [
      { label: t('year'), value: resolveLabels(data.years, yearOptions) },
      {
        label: t('course'),
        value: resolveLabels(data.courseIds, courseOptions),
      },
      {
        label: t('milestone'),
        value: resolveLabels(data.milestoneIds, milestoneOptions),
      },
      { label: t('step'), value: resolveLabels(data.stepIds, stepOptions) },
      { label: t('major'), value: data.major || t('all') },
      {
        label: t('degree'),
        value: resolveLabels(data.degrees, degreeOptions),
      },
      {
        label: t('status'),
        value: resolveLabels(data.statuses as string[], statusOptions),
      },
    ];

    if (onApplyFilter) {
      onApplyFilter(data, summary);
    }
    setIsSubmit(true);
  };

  return (
    <div className="mb-6 w-full rounded-md border p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-6" // เปลี่ยนเป็น flex-col เพื่อแยกชั้น
        >
          {/* ส่วนที่ 1: กลุ่ม Input Filters */}
          <div className="flex w-full flex-row flex-wrap items-end gap-4">
            {/* ปีการศึกษา */}
            <FormField
              control={form.control}
              name="years"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('year')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={yearOptions}
                      value={(field.value ?? []) as string[]}
                      onChange={field.onChange}
                      maxDisplayItems={1}
                      enableEachCancel={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* หลักสูตร */}
            <FormField
              control={form.control}
              name="courseIds"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('course')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={courseOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      maxDisplayItems={1}
                      enableEachCancel={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ขั้นตอนการศึกษา (Milestone) */}
            <FormField
              control={form.control}
              name="milestoneIds"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('milestone')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={milestoneOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      maxDisplayItems={1}
                      enableEachCancel={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ขั้นตอนการศึกษาย่อย (Step) */}
            <FormField
              control={form.control}
              name="stepIds"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('step')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={stepOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      maxDisplayItems={1}
                      enableEachCancel={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('major')}</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input bg-background h-10"
                      placeholder={t('major-placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ระดับการศึกษา */}
            <FormField
              control={form.control}
              name="degrees"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('degree')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={degreeOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      maxDisplayItems={1}
                      enableEachCancel={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* สถานะ */}
            <FormField
              control={form.control}
              name="statuses"
              render={({ field }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormLabel>{t('status')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={statusOptions}
                      value={(field.value ?? []) as string[]}
                      onChange={field.onChange}
                      maxDisplayItems={1}
                      enableEachCancel={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ส่วนที่ 2: กลุ่มปุ่ม (อยู่ด้านล่างเสมอ) */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="min-w-[120px]"
              onClick={onExportExcel}
              disabled={isSubmit === false}
            >
              <Table className="h-4 w-4" />
              <span className="flex items-center gap-2">
                {t('export-excel')}
              </span>
            </Button>
            <Button type="submit" className="min-w-[120px]">
              <Filter className="h-4 w-4" />
              <span className="flex items-center gap-2">
                {t('apply-filters')}
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
