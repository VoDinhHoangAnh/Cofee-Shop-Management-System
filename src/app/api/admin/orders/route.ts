// src/app/api/admin/orders/route.ts

import { requireManagerSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { orderService } from "@/modules/orders/order.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireManagerSession();

    const orders = await orderService.findAdminOrders();

    return NextResponse.json(orders);
  } catch (error) {
    return handleRouteError(error, "Failed to fetch orders");
  }
}