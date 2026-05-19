// src/app/api/admin/products/route.ts

import { getSession } from "@/lib/auth/auth";
import { ProductError } from "@/modules/products/product.errors";
import { productService } from "@/modules/products/product.service";
import { NextResponse } from "next/server";

interface ManagerSession {
  id: string;
  role: string;
}

async function requireManagerSession() {
  const session = await getSession();

  if (!session || session.role !== "MANAGER") {
    throw new ProductError("Unauthorized", 401);
  }

  return session as ManagerSession;
}

function handleProductRouteError(error: unknown) {
  if (error instanceof ProductError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

export async function GET() {
  try {
    await requireManagerSession();

    const products = await productService.findAll();

    return NextResponse.json(products);
  } catch (error) {
    return handleProductRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireManagerSession();
    const body = await request.json();

    const product = await productService.create(body, session.id);

    return NextResponse.json(product);
  } catch (error) {
    return handleProductRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireManagerSession();
    const body = await request.json();

    const product = await productService.update(body, session.id);

    return NextResponse.json(product);
  } catch (error) {
    return handleProductRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireManagerSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const result = await productService.remove(id, session.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleProductRouteError(error);
  }
}