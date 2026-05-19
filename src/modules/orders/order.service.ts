// src/modules/orders/order.service.ts

import { RouteError } from "@/lib/http/route-error";
import { ObjectId } from "mongodb";
import type { CreateOrderDto } from "./dto/create-order.dto";
import { orderRepository } from "./order.repository";

function assertValidObjectId(id: string | undefined | null, message: string) {
  if (!id || !ObjectId.isValid(id)) {
    throw new RouteError(message, 400);
  }

  return new ObjectId(id);
}

export const orderService = {
  async create(dto: CreateOrderDto, actorId: string) {
    const userObjectId = assertValidObjectId(actorId, "Invalid session. Please log in again.");

    const { items, totalPrice } = dto;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new RouteError("Order must have at least one item", 400);
    }

    if (totalPrice === undefined || totalPrice <= 0) {
      throw new RouteError("Invalid total price", 400);
    }

    const now = new Date();
    const orderCode = `BILL-${Date.now()}`;

    const orderInsert = await orderRepository.createOrder({
      code: orderCode,
      status: "PENDING",
      totalPrice,
      userId: userObjectId,
      createdAt: now,
      updatedAt: now,
    });

    const orderId = orderInsert.insertedId;

    const orderItems = items.map((item) => ({
      orderId,
      productId: assertValidObjectId(item.productId, "Invalid product ID"),
      sizeId: assertValidObjectId(item.sizeId, "Invalid size ID"),
      quantity: item.quantity,
      price: item.price,
      note: item.note || null,
    }));

    await orderRepository.insertOrderItems(orderItems);

    await orderRepository.createAuditLog({
      userId: userObjectId,
      action: "CREATE_ORDER",
      target: `Order:${orderId}`,
      dataAfter: JSON.stringify({
        id: orderId.toString(),
        code: orderCode,
        totalPrice,
      }),
      timestamp: now,
    });

    return {
      id: orderId.toString(),
      code: orderCode,
      status: "PENDING",
      totalPrice,
    };
  },

  async findAdminOrders() {
    return orderRepository.findAdminOrders();
  },
};