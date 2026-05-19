// src/lib/auth/route-session.ts

import { getSession } from "@/lib/auth/auth";
import { RouteError } from "@/lib/http/route-error";
import { ObjectId } from "mongodb";

export interface AppSession {
  id: string;
  username?: string;
  role: string;
  name?: string;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new RouteError("Unauthorized", 401);
  }

  if (!ObjectId.isValid(session.id as string)) {
    throw new RouteError("Invalid session. Please log in again.", 401);
  }

  return session as AppSession;
}

export async function requireManagerSession() {
  const session = await requireSession();

  if (session.role !== "MANAGER") {
    throw new RouteError("Unauthorized", 401);
  }

  return session;
}