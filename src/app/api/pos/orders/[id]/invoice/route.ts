// src/app/api/pos/orders/[id]/invoice/route.ts

import { requireSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { invoiceService } from "@/modules/invoices/invoice.service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();

    const { id } = await params;
    const invoice = await invoiceService.getInvoice(id);

    return NextResponse.json(invoice);
  } catch (error) {
    return handleRouteError(error);
  }
}