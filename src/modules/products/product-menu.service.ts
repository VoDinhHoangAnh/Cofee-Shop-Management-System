// src/modules/products/product-menu.service.ts

import { getDb } from "@/lib/db/mongodb";
import type { PosMenuView } from "./product-menu.types";

export const productMenuService = {
  async getPosMenu(): Promise<PosMenuView> {
    const db = await getDb();

    const categories = await db.collection("Category").find().toArray();

    const products = await db
      .collection("Product")
      .aggregate([
        { $match: { status: "AVAILABLE" } },
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
            basePrice: 1,
            image: 1,
            categoryIDs: {
              $map: {
                input: "$categoryIDs",
                as: "cid",
                in: { $toString: "$$cid" },
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
      ])
      .toArray();

    const toppings = await db.collection("Topping").find().toArray();

    return {
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
      })),
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        image: product.image || null,
        categoryIDs: product.categoryIDs || [],
        sizes: product.sizes || [],
      })),
      toppings: toppings.map((topping) => ({
        id: topping._id.toString(),
        name: topping.name,
        price: topping.price,
      })),
    };
  },
};