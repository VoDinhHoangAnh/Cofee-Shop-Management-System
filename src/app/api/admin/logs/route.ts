// src/app/api/admin/logs/route.ts

import { requireManagerSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { logService } from "@/modules/logs/log.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireManagerSession();

    const logs = await logService.findRecentLogs();

    return NextResponse.json(logs);
  } catch (error) {
    return handleRouteError(error);
  }
}