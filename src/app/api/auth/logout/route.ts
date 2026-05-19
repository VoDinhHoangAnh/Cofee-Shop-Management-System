// src/app/api/auth/logout/route.ts

import { authService } from "@/modules/auth/auth.service";
import { redirect } from "next/navigation";

export async function POST() {
  await authService.logout();
  redirect("/login");
}