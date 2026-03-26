import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    status: ProductStatus;
    name: string;
    createdAt: bigint;
    sellingPrice: number;
    photoUrl: string;
    costPrice: number;
}
export interface ProductInput {
    name: string;
    sellingPrice: number;
    photoUrl: string;
    costPrice: number;
}
export interface UserProfile {
    name: string;
}
export enum ProductStatus {
    sold = "sold",
    stock = "stock"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(input: ProductInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSoldProducts(): Promise<Array<Product>>;
    getStockProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleProductStatus(productId: bigint): Promise<void>;
}
