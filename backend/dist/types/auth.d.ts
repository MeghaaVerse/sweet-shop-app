export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    token: string;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
//# sourceMappingURL=auth.d.ts.map