"use server";

import { cookies } from "next/headers";

export async function setLocale(locale: string) {
  const c = (await cookies());
  c.set("locale", locale, {
    path: "/",
    httpOnly: false, // ให้ฝั่ง client อ่านได้ถ้าต้องการ
    sameSite: "lax"
  });
}
