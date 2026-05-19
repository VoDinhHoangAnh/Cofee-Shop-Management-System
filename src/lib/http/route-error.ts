// src/lib/http/route-error.ts

import { NextResponse } from "next/server";

export class RouteError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "RouteError";
  }
}

export function handleRouteError(
  error: unknown,
  fallbackMessage = "Internal server error",
) {
  if (error instanceof RouteError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: fallbackMessage },
    { status: 500 },
  );
}