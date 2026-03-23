import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductInfo {
    id: bigint;
    name: string;
    sellingPrice: bigint;
    quantity: bigint;
    costPrice: bigint;
}
export interface ProductInput {
    name: string;
    sellingPrice: bigint;
    quantity: bigint;
    costPrice: bigint;
}
export type Time = bigint;
export interface SaleInfo {
    id: bigint;
    productId: bigint;
    timestamp: Time;
    quantity: bigint;
    profit: bigint;
    costPrice: bigint;
    totalPrice: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(productInput: ProductInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    editProduct(id: bigint, productInput: ProductInput): Promise<void>;
    getAllProducts(): Promise<Array<ProductInfo>>;
    getAllSales(): Promise<Array<SaleInfo>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(id: bigint): Promise<ProductInfo>;
    getProductsByName(searchTerm: string): Promise<Array<ProductInfo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeProduct(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sellProduct(productId: bigint, quantity: bigint): Promise<bigint>;
}
