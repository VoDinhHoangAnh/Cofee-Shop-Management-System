// src/app/api/pos/orders/[id]/ticket/route.ts

import { requireSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { invoiceService } from "@/modules/invoices/invoice.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();

    const { id } = await params;
    const ticket = await invoiceService.sendKitchenTicket(id);

    return NextResponse.json(ticket);
  } catch (error) {
    return handleRouteError(error, "Failed to send ticket");
  }
}