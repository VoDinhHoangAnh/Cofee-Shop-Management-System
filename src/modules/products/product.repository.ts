// src/modules/products/product.repository.ts

import { getDb } from "@/lib/db/mongodb";
import { ObjectId, type Document } from "mongodb";
import type {
  NormalizedProductSize,
  ProductCreateData,
  ProductUpdateData,
} from "./product.types";

export const productRepository = {
  async findAll() {
    const db = await getDb();

    return db
      .collection("Product")
      .aggregate([
        {
          $lookup: {
            from: "Category",
            localField: "categoryIDs",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $lookup: {
            from: "Size",
            localField: "_id",
            foreignField: "productId",
            as: "sizes",
          },
        },
        {
          $project: {
            id: { $toString: "$_id" },
            name: 1,
            description: 1,
            image: 1,
            basePrice: 1,
            status: 1,
            categoryIDs: 1,
            createdAt: 1,
            updatedAt: 1,
            categories: {
              $map: {
                input: "$categories",
                as: "cat",
                in: { id: { $toString: "$$cat._id" }, name: "$$cat.name" },
              },
            },
            sizes: {
              $map: {
                input: "$sizes",
                as: "size",
                in: {
                  id: { $toString: "$$size._id" },
                  name: "$$size.name",
                  price: "$$size.price",
                },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();
  },

  async createProduct(data: ProductCreateData) {
    const db = await getDb();

    const result = await db.collection("Product").insertOne(data);

    return result.insertedId;
  },

  async insertSizes(productId: ObjectId, sizes: NormalizedProductSize[]) {
    if (sizes.length === 0) return;

    const db = await getDb();

    await db.collection("Size").insertMany(
      sizes.map((size) => ({
        name: size.name,
        price: size.price,
        productId,
      })),
    );
  },

  async replaceSizes(productId: ObjectId, sizes: NormalizedProductSize[]) {
    const db = await getDb();

    await db.collection("Size").deleteMany({ productId });

    if (sizes.length > 0) {
      await db.collection("Size").insertMany(
        sizes.map((size) => ({
          name: size.name,
          price: size.price,
          productId,
        })),
      );
    }
  },

  async addProductToCategory(categoryId: ObjectId, productId: ObjectId) {
    const db = await getDb();

    await db
      .collection("Category")
      .updateOne(
        { _id: categoryId },
        { $addToSet: { productIDs: productId } },
      );
  },

  async updateProduct(id: ObjectId, updateData: ProductUpdateData) {
    const db = await getDb();

    return db.collection("Product").findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: "after" },
    );
  },

  async countPendingOrdersContainingProduct(productId: ObjectId) {
    const db = await getDb();

    const result = await db
      .collection("Order")
      .aggregate([
        { $match: { status: "PENDING" } },
        {
          $lookup: {
            from: "OrderItem",
            localField: "_id",
            foreignField: "orderId",
            as: "items",
          },
        },
        { $match: { "items.productId": productId } },
        { $count: "count" },
      ])
      .toArray();

    return result.length > 0 ? result[0].count : 0;
  },

  async deleteProduct(id: ObjectId) {
    const db = await getDb();

    return db.collection("Product").findOneAndDelete({
      _id: id,
    });
  },

  async deleteSizes(productId: ObjectId) {
    const db = await getDb();

    await db.collection("Size").deleteMany({ productId });
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

    await db.collection("AuditLog").insertOne(data as Document);
  },
};