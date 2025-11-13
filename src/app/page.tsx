"use client";
import Image from "next/image";
import { DataTableDemo } from "../components/data-table-demo";
// ...existing code...
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert mb-4"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="w-full">
          <h2 className="mt-4 text-2xl font-semibold text-Black">Students</h2>
          <DataTableDemo />
        </div>
      </main>
    </div>
  );
}
