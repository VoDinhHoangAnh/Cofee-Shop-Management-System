// src/modules/payments/dto/pay-order.dto.ts

export interface PayOrderDto {
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
}