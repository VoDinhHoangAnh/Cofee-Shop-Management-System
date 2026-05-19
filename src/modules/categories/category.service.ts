// src/modules/categories/category.service.ts

import { ObjectId } from "mongodb";
import type { CreateCategoryDto } from "./dto/create-category.dto";
import type { UpdateCategoryDto } from "./dto/update-category.dto";
import { categoryRepository } from "./category.repository";
import type { CategoryDocument, CategoryView } from "./category.types";

export class CategoryServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "CategoryServiceError";
  }
}

function assertValidObjectId(id: string | null | undefined, message: string) {
  if (!id || !ObjectId.isValid(id)) {
    throw new CategoryServiceError(message, 400);
  }

  return new ObjectId(id);
}

function normalizeCategoryName(name: unknown) {
  if (typeof name !== "string") {
    throw new CategoryServiceError("Name is required", 400);
  }

  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new CategoryServiceError("Name is required", 400);
  }

  return normalizedName;
}

function mapCategoryDocument(document: CategoryDocument & { _id: ObjectId }): CategoryView {
  return {
    id: document._id.toString(),
    name: document.name,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    productIDs: document.productIDs,
  };
}

export const categoryService = {
  async findAll() {
    return categoryRepository.findAllWithProductCount();
  },

  async create(dto: CreateCategoryDto, actorId: string) {
    const name = normalizeCategoryName(dto.name);
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");

    const existing = await categoryRepository.findByName(name);

    if (existing) {
      throw new CategoryServiceError("Category already exists", 400);
    }

    const now = new Date();

    const result = await categoryRepository.create({
      name,
      createdAt: now,
      updatedAt: now,
      productIDs: [],
    });

    const category: CategoryView = {
      id: result.insertedId.toString(),
      name,
      createdAt: now,
      updatedAt: now,
      productIDs: [],
    };

    await categoryRepository.createAuditLog({
      userId: actorObjectId,
      action: "CREATE_CATEGORY",
      target: `Category:${category.id}`,
      dataAfter: JSON.stringify(category),
      timestamp: now,
    });

    return category;
  },

  async update(dto: UpdateCategoryDto, actorId: string) {
    const categoryObjectId = assertValidObjectId(dto.id, "Invalid data");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");
    const name = normalizeCategoryName(dto.name);

    const existing = await categoryRepository.findByName(name);

    if (existing && existing._id && existing._id.toString() !== dto.id) {
      throw new CategoryServiceError("Category already exists", 400);
    }

    const now = new Date();

    const updatedCategory = await categoryRepository.update(categoryObjectId, {
      name,
      updatedAt: now,
    });

    if (!updatedCategory || !updatedCategory._id) {
      throw new CategoryServiceError("Category not found", 404);
    }

    const category = mapCategoryDocument(
      updatedCategory as CategoryDocument & { _id: ObjectId },
    );

    await categoryRepository.createAuditLog({
      userId: actorObjectId,
      action: "UPDATE_CATEGORY",
      target: `Category:${dto.id}`,
      dataAfter: JSON.stringify(category),
      timestamp: now,
    });

    return category;
  },

  async remove(id: string | null, actorId: string) {
    const categoryObjectId = assertValidObjectId(id, "Invalid ID");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");

    const productCount =
      await categoryRepository.countProductsByCategory(categoryObjectId);

    if (productCount > 0) {
      throw new CategoryServiceError(
        "Cannot delete category with associated products",
        400,
      );
    }

    const deletedCategory = await categoryRepository.delete(categoryObjectId);

    if (!deletedCategory) {
      throw new CategoryServiceError("Category not found", 404);
    }

    await categoryRepository.createAuditLog({
      userId: actorObjectId,
      action: "DELETE_CATEGORY",
      target: `Category:${id}`,
      dataBefore: JSON.stringify(deletedCategory),
      timestamp: new Date(),
    });

    return { message: "Category deleted" };
  },
};