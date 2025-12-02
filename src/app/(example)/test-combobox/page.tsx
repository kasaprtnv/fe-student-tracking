'use client';

import { useState } from 'react';
import { MultiSelect } from '@/components/ui/combobox-multi';
import { SelectOption } from '@/types';

const fruits: SelectOption[] = [
  { label: 'แอปเปิ้ล', value: 'apple' },
  { label: 'กล้วย', value: 'banana' },
  { label: 'ส้ม', value: 'orange' },
  { label: 'องุ่น', value: 'grape' },
  { label: 'สตรอเบอร์รี่', value: 'strawberry' },
  { label: 'มะม่วง', value: 'mango' },
  { label: 'สับปะรด', value: 'pineapple' },
  { label: 'มะละกอ', value: 'papaya' },
  { label: 'กีวี่', value: 'kiwi' },
  { label: 'ลิ้นจี่', value: 'lychee' },
];

const courses: SelectOption[] = [
  {
    label: 'React Development',
    value: 'react',
    description:
      'สร้างเว็บแอพพลิเคชันด้วย React, Hooks และ Context API พร้อมจัดการ State ขั้นสูง',
  },
  {
    label: 'Node.js Backend',
    value: 'nodejs',
    description:
      'พัฒนา Backend API ด้วย Node.js, Express, MongoDB และ Authentication',
  },
  {
    label: 'TypeScript Mastery',
    value: 'typescript',
    description:
      'เรียนรู้ TypeScript ตั้งแต่พื้นฐานไปจนถึงขั้นสูง Generic, Utility Types',
  },
  {
    label: 'Database Design',
    value: 'database',
    description:
      'ออกแบบฐานข้อมูลที่มีประสิทธิภาพ SQL, NoSQL และการเพิ่มประสิทธิภาพ',
  },
  {
    label: 'UI/UX Design',
    value: 'uiux',
    description:
      'ออกแบบ User Interface และ User Experience ที่ดึงดูดและใช้งานง่าย',
  },
  {
    label: 'DevOps Engineering',
    value: 'devops',
    description:
      'CI/CD Pipeline, Docker, Kubernetes และการจัดการ Infrastructure',
  },
];

export default function TestComboboxPage() {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  return (
    <div className="container mx-auto space-y-12 p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Combobox</h1>
      </div>

      {/* ============ MultiSelect ธรรมดา ============ */}
      <section className="rounded-lg bg-blue-50 p-6">
        <h2 className="mb-6 text-2xl font-bold text-blue-700">
          📦 MultiSelect (แบบธรรมดา)
        </h2>

        {/* Example 1: Empty state */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold">
            1. เลือกผลไม้ (เริ่มต้นว่าง)
          </h3>
          <MultiSelect
            options={fruits}
            value={selectedFruits}
            onChange={setSelectedFruits}
            placeholder="เลือกผลไม้ที่ชอบ..."
          />
          <div className="rounded border-l-4 border-blue-400 bg-white p-3">
            <p className="text-sm">
              <strong>ผลไม้ที่เลือก:</strong>{' '}
              {selectedFruits.length > 0
                ? selectedFruits.join(', ')
                : 'ยังไม่ได้เลือก'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
