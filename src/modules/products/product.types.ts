// src/modules/products/product.types.ts

import type { ObjectId } from "mongodb";

export type ProductStatus = "AVAILABLE" | "UNAVAILABLE" | "DISABLED" | string;

export interface ProductCategoryView {
  id: string;
  name: string;
}

export interface ProductSizeView {
  id: string;
  name: string;
  price: number;
}

export interface ProductView {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  basePrice: number;
  status?: ProductStatus;
  categoryIDs?: ObjectId[] | string[];
  categories?: ProductCategoryView[];
  sizes?: ProductSizeView[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NormalizedProductSize {
  name: string;
  price: number;
}

export interface ProductCreateData {
  name: string;
  description?: string;
  image?: string | null;
  basePrice: number;
  categoryIDs: ObjectId[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUpdateData {
  name?: string;
  description?: string | null;
  image?: string | null;
  basePrice?: number;
  status?: ProductStatus;
  categoryIDs?: ObjectId[];
  updatedAt: Date;
}