// src/app/api/auth/login/route.ts

import { handleRouteError } from "@/lib/http/route-error";
import { authService } from "@/modules/auth/auth.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.login(body);

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}