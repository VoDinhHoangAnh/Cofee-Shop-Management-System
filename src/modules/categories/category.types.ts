// src/modules/categories/category.types.ts

import type { ObjectId } from "mongodb";

export interface CategoryDocument {
  _id?: ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  productIDs?: ObjectId[];
}

export interface CategoryListItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

export interface CategoryView {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  productIDs?: ObjectId[];
}

export interface CreateCategoryData {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  productIDs: ObjectId[];
}

export interface UpdateCategoryData {
  name: string;
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