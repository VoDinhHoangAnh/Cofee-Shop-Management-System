// src/modules/orders/order.repository.ts

import { getDb } from "@/lib/db/mongodb";
import type { ObjectId } from "mongodb";
import type { CreateOrderData, CreateOrderItemData } from "./order.types";

export const orderRepository = {
  async createOrder(data: CreateOrderData) {
    const db = await getDb();

    return db.collection("Order").insertOne(data);
  },

  async insertOrderItems(items: CreateOrderItemData[]) {
    const db = await getDb();

    return db.collection("OrderItem").insertMany(items);
  },

  async findAdminOrders() {
    const db = await getDb();

    return db
      .collection("Order")
      .aggregate([
        {
          $lookup: {
            from: "User",
            localField: "userId",
            foreignField: "_id",
            as: "staff",
          },
        },
        { $unwind: "$staff" },
        {
          $lookup: {
            from: "OrderItem",
            localField: "_id",
            foreignField: "orderId",
            as: "items",
          },
        },
        {
          $project: {
            id: { $toString: "$_id" },
            code: 1,
            status: 1,
            totalPrice: 1,
            paymentMethod: 1,
            createdAt: 1,
            staffName: "$staff.name",
            itemCount: { $size: "$items" },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
      ])
      .toArray();
  },

  async createAuditLog(data: {
    userId: ObjectId;
    action: string;
    target: string;
    dataBefore?: string;
    dataAfter?: string;
    timestamp: Date;
  }) {
    const db = await getDb();

    await db.collection("AuditLog").insertOne(data);
  },
};