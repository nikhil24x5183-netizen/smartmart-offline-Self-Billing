
export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  tax: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  tokenId: string;
}

export interface ExitToken {
  id: string;
  saleId: string;
  timestamp: number;
  expiresAt: number;
  status: 'active' | 'verified' | 'expired';
}

export enum UserRole {
  GUEST = 'GUEST',
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export type ViewState = 'LANDING' | 'SHOPPING' | 'CART' | 'TOKEN' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'ADMIN_INVENTORY' | 'ADMIN_SALES' | 'ADMIN_VERIFY';
