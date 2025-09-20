// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Sweet types
export interface Sweet {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateSweetRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
}

export interface UpdateSweetRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
}

export interface SweetsResponse {
  sweets: Sweet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Inventory types
export interface InventoryLog {
  id: string;
  sweetId: string;
  type: 'RESTOCK' | 'SALE' | 'DAMAGE' | 'EXPIRED';
  quantity: number;
  reason: string | null;
  createdAt: string;
  sweet: {
    id: string;
    name: string;
    category: string;
    currentStock?: number;
    stock?: number;
  };
}

export interface InventoryLogRequest {
  sweetId: string;
  type: 'RESTOCK' | 'SALE' | 'DAMAGE' | 'EXPIRED';
  quantity: number;
  reason?: string;
}

export interface InventoryReport {
  totalSweets: number;
  totalValue: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    category: string;
    currentStock: number;
    price: number;
  }>;
  recentActivities: InventoryLog[];
  categoryBreakdown: Array<{
    category: string;
    totalItems: number;
    totalValue: number;
    averageStock: number;
  }>;
}

export interface StockAlert {
  sweetId: string;
  sweetName: string;
  currentStock: number;
  threshold: number;
  severity: 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
}