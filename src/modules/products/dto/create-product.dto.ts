// src/modules/products/dto/create-product.dto.ts

import type { ProductSizeDto } from "./product-size.dto";

export interface CreateProductDto {
  name: string;
  description?: string;
  basePrice: string | number;
  categoryId: string;
  sizes?: ProductSizeDto[];
  image?: string | null;
}