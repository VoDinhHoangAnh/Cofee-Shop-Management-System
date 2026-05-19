// src/modules/orders/dto/create-order.dto.ts

export interface CreateOrderItemDto {
  productId: string;
  sizeId: string;
  quantity: number;
  price: number;
  note?: string | null;
}

export interface CreateOrderDto {
  items?: CreateOrderItemDto[];
  totalPrice?: number;
}