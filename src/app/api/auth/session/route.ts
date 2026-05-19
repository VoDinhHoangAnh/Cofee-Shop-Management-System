// src/app/api/auth/session/route.ts

import { authService } from "@/modules/auth/auth.service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await authService.getCurrentSession();

  return NextResponse.json(session);
}