// src/modules/invoices/invoice.service.ts

import { getDb } from "@/lib/db/mongodb";
import { RouteError } from "@/lib/http/route-error";
import { ObjectId } from "mongodb";
import type { InvoiceView, KitchenTicketView } from "./invoice.types";

function assertValidObjectId(id: string | undefined | null, message: string) {
  if (!id || !ObjectId.isValid(id)) {
    throw new RouteError(message, 400);
  }

  return new ObjectId(id);
}

export const invoiceService = {
  async getInvoice(orderId: string): Promise<InvoiceView> {
    const orderObjectId = assertValidObjectId(orderId, "Invalid order ID");
    const db = await getDb();

    const order = await db
      .collection("Order")
      .aggregate([
        { $match: { _id: orderObjectId } },
        {
          $lookup: {
            from: "OrderItem",
            localField: "_id",
            foreignField: "orderId",
            as: "items",
          },
        },
        {
          $lookup: {
            from: "User",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .next();

    if (!order) {
      throw new RouteError("Order not found", 404);
    }

    if (order.status !== "PAID") {
      throw new RouteError("Cannot print invoice for unpaid order", 400);
    }

    for (const item of order.items) {
      item.product = await db.collection("Product").findOne({ _id: item.productId });
      item.size = await db.collection("Size").findOne({ _id: item.sizeId });
    }

    return {
      id: order._id.toString(),
      code: order.code,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      staff: order.user.name,
      items: order.items.map((item: any) => ({
        name: item.product.name,
        size: item.size.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        note: item.note,
      })),
    };
  },

  async sendKitchenTicket(orderId: string): Promise<KitchenTicketView | { message: string }> {
    const orderObjectId = assertValidObjectId(orderId, "Invalid order ID");
    const db = await getDb();

    const unsentItems = await db
      .collection("OrderItem")
      .aggregate([
        {
          $match: {
            orderId: orderObjectId,
            isSentToKitchen: { $ne: true },
          },
        },
        {
          $lookup: {
            from: "Product",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $lookup: {
            from: "Size",
            localField: "sizeId",
            foreignField: "_id",
            as: "size",
          },
        },
        { $unwind: "$product" },
        { $unwind: "$size" },
      ])
      .toArray();

    if (unsentItems.length === 0) {
      return { message: "No new items to send to kitchen" };
    }

    await db.collection("OrderItem").updateMany(
      { _id: { $in: unsentItems.map((item) => item._id) } },
      {
        $set: {
          isSentToKitchen: true,
          sentAt: new Date(),
        },
      },
    );

    return {
      orderId,
      timestamp: new Date(),
      items: unsentItems.map((item) => ({
        name: item.product.name,
        size: item.size.name,
        quantity: item.quantity,
        note: item.note,
      })),
    };
  },
};