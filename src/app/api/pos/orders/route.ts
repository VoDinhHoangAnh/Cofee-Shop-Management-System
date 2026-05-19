// src/app/api/pos/orders/route.ts

import { requireSession } from "@/lib/auth/route-session";
import { handleRouteError, RouteError } from "@/lib/http/route-error";
import { orderService } from "@/modules/orders/order.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    let body;
    try {
      body = await request.json();
    } catch {
      throw new RouteError("Invalid JSON", 400);
    }

    const order = await orderService.create(body, session.id);

    return NextResponse.json(order);
  } catch (error) {
    return handleRouteError(error, "Failed to create order");
  }
}