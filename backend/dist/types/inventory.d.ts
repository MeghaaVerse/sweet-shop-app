export interface InventoryLogRequest {
    sweetId: string;
    type: 'RESTOCK' | 'SALE' | 'DAMAGE' | 'EXPIRED';
    quantity: number;
    reason?: string;
}
export interface InventoryLogResponse {
    id: string;
    sweetId: string;
    type: string;
    quantity: number;
    reason: string | null;
    createdAt: Date;
    sweet: {
        id: string;
        name: string;
        category: string;
        currentStock: number;
    };
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
    recentActivities: InventoryLogResponse[];
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
//# sourceMappingURL=inventory.d.ts.map