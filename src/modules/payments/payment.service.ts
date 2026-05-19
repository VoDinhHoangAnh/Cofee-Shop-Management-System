// src/modules/payments/payment.service.ts

import { RouteError } from "@/lib/http/route-error";
import { ObjectId } from "mongodb";
import type { PayOrderDto } from "./dto/pay-order.dto";
import { paymentRepository } from "./payment.repository";
import type { PaymentUpdateData } from "./payment.types";

function assertValidObjectId(id: string | undefined | null, message: string) {
  if (!id || !ObjectId.isValid(id)) {
    throw new RouteError(message, 400);
  }

  return new ObjectId(id);
}

export const paymentService = {
  async payOrder(orderId: string, dto: PayOrderDto, actorId: string) {
    const orderObjectId = assertValidObjectId(orderId, "Invalid order ID");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");

    if (!dto.paymentMethod) {
      throw new RouteError("Payment method is required", 400);
    }

    const now = new Date();

    const updateData: PaymentUpdateData = {
      status: "PAID",
      paymentMethod: dto.paymentMethod,
      updatedAt: now,
    };

    if (dto.paymentMethod === "CASH") {
      updateData.cashReceived = Number(dto.cashReceived || 0);
      updateData.change = Number(dto.change || 0);
    }

    const result = await paymentRepository.payOrder(orderObjectId, updateData);

    if (!result) {
      throw new RouteError("Order not found", 404);
    }

    await paymentRepository.createAuditLog({
      userId: actorObjectId,
      action: "PAY_ORDER",
      target: `Order:${orderId}`,
      dataAfter: JSON.stringify(result),
      timestamp: now,
    });

    return {
      ...result,
      id: result._id.toString(),
    };
  },
};