// src/modules/toppings/topping.service.ts

import { RouteError } from "@/lib/http/route-error";
import { ObjectId } from "mongodb";
import type { CreateToppingDto } from "./dto/create-topping.dto";
import type { UpdateToppingDto } from "./dto/update-topping.dto";
import { toppingRepository } from "./topping.repository";
import type { ToppingDocument, ToppingView, UpdateToppingData } from "./topping.types";

function assertValidObjectId(id: string | null | undefined, message: string) {
  if (!id || !ObjectId.isValid(id)) {
    throw new RouteError(message, 400);
  }

  return new ObjectId(id);
}

function normalizeName(name: unknown) {
  if (typeof name !== "string" || !name.trim()) {
    throw new RouteError("Name is required", 400);
  }

  return name.trim();
}

function parseToppingPrice(price: unknown) {
  if (price === undefined || price === null || price === "") {
    throw new RouteError("Price is required", 400);
  }

  const parsedPrice = Number(price);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new RouteError("Price must be at least 0", 400);
  }

  return parsedPrice;
}

function parseOptionalToppingPrice(price: unknown) {
  if (price === undefined || price === null || price === "") {
    return undefined;
  }

  const parsedPrice = Number(price);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new RouteError("Price must be at least 0", 400);
  }

  return parsedPrice;
}

function mapTopping(document: ToppingDocument & { _id: ObjectId }): ToppingView {
  return {
    id: document._id.toString(),
    name: document.name,
    price: document.price,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export const toppingService = {
  async findAll() {
    const toppings = await toppingRepository.findAll();

    return toppings.map((topping) =>
      mapTopping(topping as ToppingDocument & { _id: ObjectId }),
    );
  },

  async create(dto: CreateToppingDto, actorId: string) {
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");
    const name = normalizeName(dto.name);
    const price = parseToppingPrice(dto.price);
    const now = new Date();

    const result = await toppingRepository.create({
      name,
      price,
      createdAt: now,
      updatedAt: now,
    });

    const topping: ToppingView = {
      id: result.insertedId.toString(),
      name,
      price,
      createdAt: now,
      updatedAt: now,
    };

    await toppingRepository.createAuditLog({
      userId: actorObjectId,
      action: "CREATE_TOPPING",
      target: `Topping:${topping.id}`,
      dataAfter: JSON.stringify(topping),
      timestamp: now,
    });

    return topping;
  },

  async update(dto: UpdateToppingDto, actorId: string) {
    const toppingObjectId = assertValidObjectId(dto.id, "Invalid ID");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");

    const now = new Date();
    const updateData: UpdateToppingData = {
      updatedAt: now,
    };

    if (dto.name !== undefined) {
      updateData.name = normalizeName(dto.name);
    }

    const parsedPrice = parseOptionalToppingPrice(dto.price);

    if (parsedPrice !== undefined) {
      updateData.price = parsedPrice;
    }

    const result = await toppingRepository.update(toppingObjectId, updateData);

    if (!result || !result._id) {
      throw new RouteError("Topping not found", 404);
    }

    const topping = mapTopping(result as ToppingDocument & { _id: ObjectId });

    await toppingRepository.createAuditLog({
      userId: actorObjectId,
      action: "UPDATE_TOPPING",
      target: `Topping:${dto.id}`,
      dataAfter: JSON.stringify(topping),
      timestamp: now,
    });

    return topping;
  },

  async remove(id: string | null, actorId: string) {
    const toppingObjectId = assertValidObjectId(id, "Invalid ID");
    const actorObjectId = assertValidObjectId(actorId, "Invalid user ID");

    const result = await toppingRepository.delete(toppingObjectId);

    if (!result) {
      throw new RouteError("Topping not found", 404);
    }

    await toppingRepository.createAuditLog({
      userId: actorObjectId,
      action: "DELETE_TOPPING",
      target: `Topping:${id}`,
      dataBefore: JSON.stringify(result),
      timestamp: new Date(),
    });

    return { message: "Topping deleted" };
  },
};