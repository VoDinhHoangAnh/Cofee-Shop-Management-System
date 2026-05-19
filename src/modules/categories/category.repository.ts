// src/modules/categories/category.repository.ts

import { getDb } from "@/lib/db/mongodb";
import type { ObjectId } from "mongodb";
import type {
  AuditLogData,
  CategoryDocument,
  CategoryListItem,
  CreateCategoryData,
  UpdateCategoryData,
} from "./category.types";

export const categoryRepository = {
  async findAllWithProductCount() {
    const db = await getDb();

    return db
      .collection<CategoryDocument>("Category")
      .aggregate<CategoryListItem>([
        {
          $lookup: {
            from: "Product",
            localField: "_id",
            foreignField: "categoryIDs",
            as: "products",
          },
        },
        {
          $project: {
            id: { $toString: "$_id" },
            name: 1,
            createdAt: 1,
            updatedAt: 1,
            _count: { products: { $size: "$products" } },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();
  },

  async findByName(name: string) {
    const db = await getDb();

    return db.collection<CategoryDocument>("Category").findOne({ name });
  },

  async create(data: CreateCategoryData) {
    const db = await getDb();

    return db.collection<CategoryDocument>("Category").insertOne(data);
  },

  async update(id: ObjectId, data: UpdateCategoryData) {
    const db = await getDb();

    return db.collection<CategoryDocument>("Category").findOneAndUpdate(
      { _id: id },
      { $set: data },
      { returnDocument: "after" },
    );
  },

  async countProductsByCategory(categoryId: ObjectId) {
    const db = await getDb();

    return db.collection("Product").countDocuments({
      categoryIDs: categoryId,
    });
  },

  async delete(id: ObjectId) {
    const db = await getDb();

    return db.collection<CategoryDocument>("Category").findOneAndDelete({
      _id: id,
    });
  },

  async createAuditLog(data: AuditLogData) {
    const db = await getDb();

    await db.collection("AuditLog").insertOne(data);
  },
};