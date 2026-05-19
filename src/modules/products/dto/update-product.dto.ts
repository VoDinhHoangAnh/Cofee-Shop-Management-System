// src/modules/products/dto/update-product.dto.ts

import type { ProductSizeDto } from "./product-size.dto";
import type { ProductStatus } from "../product.types";

export interface UpdateProductDto {
  id: string;
  name?: string;
  description?: string | null;
  basePrice?: string | number;
  categoryIDs?: string[];
  status?: ProductStatus;
  sizes?: ProductSizeDto[];
  image?: string | null;
}