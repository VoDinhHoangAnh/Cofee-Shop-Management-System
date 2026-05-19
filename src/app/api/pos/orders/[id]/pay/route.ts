// src/app/api/pos/orders/[id]/pay/route.ts

import { requireSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { paymentService } from "@/modules/payments/payment.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await request.json();

    const order = await paymentService.payOrder(id, body, session.id);

    return NextResponse.json(order);
  } catch (error) {
    return handleRouteError(error, "Failed to process payment");
  }
}