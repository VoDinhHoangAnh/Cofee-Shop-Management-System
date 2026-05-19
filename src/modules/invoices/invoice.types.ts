// src/modules/invoices/invoice.types.ts

export interface InvoiceItemView {
  name: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
  note?: string | null;
}

export interface InvoiceView {
  id: string;
  code: string;
  totalPrice: number;
  paymentMethod?: string;
  createdAt: Date;
  staff: string;
  items: InvoiceItemView[];
}

export interface KitchenTicketItemView {
  name: string;
  size: string;
  quantity: number;
  note?: string | null;
}

export interface KitchenTicketView {
  orderId: string;
  timestamp: Date;
  items: KitchenTicketItemView[];
}