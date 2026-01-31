import React, { useMemo } from 'react';
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

interface FilterStepProgressReportFormProps {
  yearOptions: SelectOption[];
  degreeOptions: SelectOption[];
  statusOptions: SelectOption[];
  onApplyFilter?: (data: IStepProgressReportFilter) => void;
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
    },
  });

  const [allMilestoneData, setAllMilestoneData] = React.useState<IMilestone[]>(
    [],
  );
  const [milestoneOptions, setMilestoneOptions] = React.useState<
    SelectOption[]
  >([]);
  const [stepOptions, setStepOptions] = React.useState<SelectOption[]>([]);

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

  // เมื่อ Course เปลี่ยน: Fetch Milestone และ เคลียร์ค่า Milestone/Step
  React.useEffect(() => {
    const updateMilestones = async () => {
      if (selectedCourseIds && selectedCourseIds.length > 0) {
        try {
          const results = await Promise.all(
            selectedCourseIds.map((id) => fetchMilestonesByCourse(id)),
          );

          // รวม Milestone จากทุก Course ที่เลือก
          const flatMilestones = results.flatMap((r) => r.data);

          setAllMilestoneData(flatMilestones);
          setMilestoneOptions(
            flatMilestones.map((m) => ({ label: m.name, value: m.id })),
          );
        } catch (error) {
          console.error('Failed to fetch milestones', error);
        }
      } else {
        setAllMilestoneData([]);
        setMilestoneOptions([]);
      }

      // เมื่อเปลี่ยน Course ให้เคลียร์ Milestone และ Step ที่เลือกไว้
      form.setValue('milestoneIds', []);
      form.setValue('stepIds', []);
    };

    updateMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseIds, fetchMilestonesByCourse]);

  // เมื่อ Milestone เปลี่ยน: กรอง Steps และ เคลียร์ค่า Step
  React.useEffect(() => {
    if (selectedMilestoneIds && selectedMilestoneIds.length > 0) {
      // กรองเฉพาะ Milestone ที่ถูกเลือกใน UI
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

    // เมื่อเปลี่ยน Milestone ให้เคลียร์ Step ที่เคยเลือกไว้
    form.setValue('stepIds', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMilestoneIds, allMilestoneData]);

  const onSubmit = (data: IStepProgressReportFilter) => {
    if (onApplyFilter) {
      onApplyFilter(data);
    }
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
