// src/modules/payments/payment.types.ts

export interface PaymentUpdateData {
  status: "PAID";
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  updatedAt: Date;
}