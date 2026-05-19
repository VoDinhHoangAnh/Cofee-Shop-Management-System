// src/app/api/admin/toppings/route.ts

import { requireManagerSession } from "@/lib/auth/route-session";
import { handleRouteError } from "@/lib/http/route-error";
import { toppingService } from "@/modules/toppings/topping.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireManagerSession();

    const toppings = await toppingService.findAll();

    return NextResponse.json(toppings);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireManagerSession();
    const body = await request.json();

    const topping = await toppingService.create(body, session.id);

    return NextResponse.json(topping);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireManagerSession();
    const body = await request.json();

    const topping = await toppingService.update(body, session.id);

    return NextResponse.json(topping);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireManagerSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const result = await toppingService.remove(id, session.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}