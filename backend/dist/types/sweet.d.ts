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
export interface SweetResponse {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    imageUrl: string | null;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
}
export interface SweetQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
    sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=sweet.d.ts.map