// src/modules/products/product-menu.types.ts

export interface PosCategoryView {
  id: string;
  name: string;
}

export interface PosProductSizeView {
  id: string;
  name: string;
  price: number;
}

export interface PosProductView {
  id: string;
  name: string;
  basePrice: number;
  image: string | null;
  categoryIDs: string[];
  sizes: PosProductSizeView[];
}

export interface PosToppingView {
  id: string;
  name: string;
  price: number;
}

export interface PosMenuView {
  categories: PosCategoryView[];
  products: PosProductView[];
  toppings: PosToppingView[];
}