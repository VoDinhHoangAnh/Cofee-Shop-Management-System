// src/modules/products/product.service.ts

import { ObjectId } from "mongodb";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { ProductSizeDto } from "./dto/product-size.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";
import { ProductError } from "./product.errors";
import { mapProductDocument, mapProductForAudit } from "./product.mapper";
import { productRepository } from "./product.repository";
import type {
  NormalizedProductSize,
  ProductUpdateData,
} from "./product.types";

function parsePositivePrice(value: unknown, fieldName = "Price") {
  if (value === undefined || value === null || value === "") {
    throw new ProductError(`${fieldName} is required`, 400);
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ProductError(`${fieldName} must be greater than 0`, 400);
  }

  return parsed;
}

function parseOptionalPositivePrice(value: unknown, fieldName = "Price") {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ProductError(`${fieldName} must be greater than 0`, 400);
  }

  return parsed;
}

function normalizeSizes(sizes?: ProductSizeDto[]) {
  if (!sizes || sizes.length === 0) {
    return [];
  }

  return sizes.map((size) => {
    if (!size.name) {
      throw new ProductError("Size name is required", 400);
    }

    return {
      name: size.name,
      price: parsePositivePrice(size.price, "Size price"),
    } satisfies NormalizedProductSize;
  });
}

function assertValidObjectId(id: string | undefined | null, message: string) {
  if (!id || !ObjectId.isValid(id)) {
    throw new ProductError(message, 400);
  }

  return new ObjectId(id);
}

export const productService = {
  async findAll() {
    return productRepository.findAll();
  },

  async create(dto: CreateProductDto, actorId: string) {
    if (!dto.name || dto.basePrice === undefined || !dto.categoryId) {
      throw new ProductError("Missing required fields", 400);
    }

    const basePrice = parsePositivePrice(dto.basePrice);
    const categoryObjectId = assertValidObjectId(
      dto.categoryId,
      "Invalid category ID",
    );
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");
    const normalizedSizes = normalizeSizes(dto.sizes);
    const now = new Date();

    const productId = await productRepository.createProduct({
      name: dto.name,
      description: dto.description,
      image: dto.image || null,
      basePrice,
      categoryIDs: [categoryObjectId],
      status: "AVAILABLE",
      createdAt: now,
      updatedAt: now,
    });

    await productRepository.insertSizes(productId, normalizedSizes);
    await productRepository.addProductToCategory(categoryObjectId, productId);

    const product = {
      id: productId.toString(),
      name: dto.name,
      description: dto.description,
      image: dto.image || null,
      basePrice,
      status: "AVAILABLE",
      createdAt: now,
      updatedAt: now,
    };

    await productRepository.createAuditLog({
      userId: actorObjectId,
      action: "CREATE_PRODUCT",
      target: `Product:${product.id}`,
      dataAfter: JSON.stringify(product),
      timestamp: now,
    });

    return product;
  },

  async update(dto: UpdateProductDto, actorId: string) {
    const productObjectId = assertValidObjectId(dto.id, "Invalid ID");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");
    const now = new Date();

    const updateData: ProductUpdateData = { updatedAt: now };

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.image !== undefined) {
      updateData.image = dto.image;
    }

    const parsedPrice = parseOptionalPositivePrice(dto.basePrice);

    if (parsedPrice !== undefined) {
      updateData.basePrice = parsedPrice;
    }

    if (dto.status) {
      updateData.status = dto.status;
    }

    if (dto.categoryIDs) {
      updateData.categoryIDs = dto.categoryIDs.map((categoryId) =>
        assertValidObjectId(categoryId, "Invalid category ID"),
      );
    }

    const result = await productRepository.updateProduct(
      productObjectId,
      updateData,
    );

    if (!result) {
      throw new ProductError("Product not found", 404);
    }

    if (dto.sizes !== undefined) {
      await productRepository.replaceSizes(
        productObjectId,
        normalizeSizes(dto.sizes),
      );
    }

    const product = mapProductDocument(result);

    await productRepository.createAuditLog({
      userId: actorObjectId,
      action: "UPDATE_PRODUCT",
      target: `Product:${dto.id}`,
      dataAfter: JSON.stringify(mapProductForAudit(product)),
      timestamp: now,
    });

    return product;
  },

  async remove(id: string | null, actorId: string) {
    const productObjectId = assertValidObjectId(id, "Invalid ID");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");

    const unpaidOrderCount =
      await productRepository.countPendingOrdersContainingProduct(
        productObjectId,
      );

    if (unpaidOrderCount > 0) {
      throw new ProductError(
        "Cannot delete product that exists in an unpaid order. Try disabling it instead.",
        400,
      );
    }

    const result = await productRepository.deleteProduct(productObjectId);

    if (!result) {
      throw new ProductError("Product not found", 404);
    }

    await productRepository.deleteSizes(productObjectId);

    await productRepository.createAuditLog({
      userId: actorObjectId,
      action: "DELETE_PRODUCT",
      target: `Product:${id}`,
      dataBefore: JSON.stringify(result),
      timestamp: new Date(),
    });

    return { message: "Product deleted" };
  },
};