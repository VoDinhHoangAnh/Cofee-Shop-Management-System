// src/modules/toppings/topping.types.ts

import type { ObjectId } from "mongodb";

export interface ToppingDocument {
  _id?: ObjectId;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToppingView {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateToppingData {
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateToppingData {
  name?: string;
  price?: number;
  updatedAt: Date;
}

export interface AuditLogData {
  userId: ObjectId;
  action: string;
  target: string;
  dataBefore?: string;
  dataAfter?: string;
  timestamp: Date;
}