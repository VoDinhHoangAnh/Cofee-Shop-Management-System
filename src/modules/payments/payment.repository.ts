// src/modules/payments/payment.repository.ts

import { getDb } from "@/lib/db/mongodb";
import type { ObjectId } from "mongodb";
import type { PaymentUpdateData } from "./payment.types";

export const paymentRepository = {
  async payOrder(orderId: ObjectId, data: PaymentUpdateData) {
    const db = await getDb();

    return db.collection("Order").findOneAndUpdate(
      { _id: orderId },
      { $set: data },
      { returnDocument: "after" },
    );
  },

  async createAuditLog(data: {
    userId: ObjectId;
    action: string;
    target: string;
    dataAfter?: string;
    timestamp: Date;
  }) {
    const db = await getDb();

    await db.collection("AuditLog").insertOne(data);
  },
};