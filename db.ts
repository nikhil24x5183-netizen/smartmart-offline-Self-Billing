
import { Product, SaleRecord, ExitToken } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'smartmart_products',
  SALES: 'smartmart_sales',
  TOKENS: 'smartmart_tokens'
};

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Fresh Milk 1L', barcode: '123456', price: 2.50, tax: 0.20, stock: 50 },
  { id: '2', name: 'Whole Grain Bread', barcode: '234567', price: 1.80, tax: 0.15, stock: 30 },
  { id: '3', name: 'Dark Chocolate', barcode: '345678', price: 3.20, tax: 0.40, stock: 100 },
  { id: '4', name: 'Coffee Beans 250g', barcode: '456789', price: 8.50, tax: 1.20, stock: 20 }
];

export const DB = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getSales: (): SaleRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },

  addSale: (sale: SaleRecord) => {
    const sales = DB.getSales();
    sales.push(sale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getTokens: (): ExitToken[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return data ? JSON.parse(data) : [];
  },

  addToken: (token: ExitToken) => {
    const tokens = DB.getTokens();
    tokens.push(token);
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  },

  updateToken: (tokenId: string, updates: Partial<ExitToken>) => {
    const tokens = DB.getTokens();
    const idx = tokens.findIndex(t => t.id === tokenId);
    if (idx !== -1) {
      tokens[idx] = { ...tokens[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    }
  }
};
