// src/modules/toppings/topping.repository.ts

import { getDb } from "@/lib/db/mongodb";
import type { ObjectId } from "mongodb";
import type {
  AuditLogData,
  CreateToppingData,
  ToppingDocument,
  UpdateToppingData,
} from "./topping.types";

export const toppingRepository = {
  async findAll() {
    const db = await getDb();

    return db
      .collection<ToppingDocument>("Topping")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
  },

  async create(data: CreateToppingData) {
    const db = await getDb();

    return db.collection<ToppingDocument>("Topping").insertOne(data);
  },

  async update(id: ObjectId, data: UpdateToppingData) {
    const db = await getDb();

    return db.collection<ToppingDocument>("Topping").findOneAndUpdate(
      { _id: id },
      { $set: data },
      { returnDocument: "after" },
    );
  },

  async delete(id: ObjectId) {
    const db = await getDb();

    return db.collection<ToppingDocument>("Topping").findOneAndDelete({
      _id: id,
    });
  },

  async createAuditLog(data: AuditLogData) {
    const db = await getDb();

    await db.collection("AuditLog").insertOne(data);
  },
};