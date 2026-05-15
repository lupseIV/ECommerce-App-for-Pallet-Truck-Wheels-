export interface AdminStats {
  totalSales: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  openTicketsCount: number;
}

export interface ProductStock {
  id: number;
  name: string;
  type: string;
  stockQty: number;
  lowStock: boolean;
}

export interface InventoryReport {
  products: ProductStock[];
  lowStockWarnings: string[];
  lowStockCount: number;
  totalProducts: number;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface ProductCreateRequest {
  type: 'WHEEL' | 'BEARING';
  name: string;
  price: number;
  stockQty: number;
  imageUrl?: string;
  material?: string;
  size?: string;
  maxLoad?: number;
  diameter?: string;
}

export interface HelpDeskRequest {
  name: string;
  email: string;
  message: string;
}

export interface SupportTicket {
  id: number;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}
