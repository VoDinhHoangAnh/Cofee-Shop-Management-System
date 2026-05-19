// src/app/api/pos/menu/route.ts

import { requireSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { productMenuService } from "@/modules/products/product-menu.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireSession();

    const menu = await productMenuService.getPosMenu();

    return NextResponse.json(menu);
  } catch (error) {
    return handleRouteError(error);
  }
}