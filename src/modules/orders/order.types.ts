// src/modules/orders/order.types.ts

import type { ObjectId } from "mongodb";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export interface CreateOrderData {
  code: string;
  status: OrderStatus;
  totalPrice: number;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderItemData {
  orderId: ObjectId;
  productId: ObjectId;
  sizeId: ObjectId;
  quantity: number;
  price: number;
  note: string | null;
}

export interface AdminOrderView {
  id: string;
  code: string;
  status: OrderStatus;
  totalPrice: number;
  paymentMethod?: string;
  createdAt: Date;
  staffName: string;
  itemCount: number;
}