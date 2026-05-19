// src/modules/products/product.errors.ts

export class ProductError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "ProductError";
  }
}