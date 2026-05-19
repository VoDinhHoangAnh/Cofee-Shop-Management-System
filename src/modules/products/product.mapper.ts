// src/modules/products/product.mapper.ts

import type { WithId, Document } from "mongodb";
import type { ProductView } from "./product.types";

export function mapProductDocument(document: WithId<Document>): ProductView {
  return {
    id: document._id.toString(),
    name: document.name,
    description: document.description,
    image: document.image,
    basePrice: document.basePrice,
    status: document.status,
    categoryIDs: document.categoryIDs,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapProductForAudit(product: ProductView) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    basePrice: product.basePrice,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}