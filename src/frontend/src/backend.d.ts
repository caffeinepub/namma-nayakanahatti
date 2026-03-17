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
    stockStatus: StockStatus;
    name: string;
    description: string;
    vendorId: bigint;
    category: ProductCategory;
    price: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    deliveryAddress: string;
    driverId?: Principal;
    scheduledTime?: Time;
    createdAt: Time;
    totalAmount: bigint;
    vendorId: bigint;
    customerId: Principal;
    landmarkNotes: string;
}
export type Time = bigint;
export interface OrderItem {
    productId: bigint;
    productName: string;
    orderId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Vendor {
    id: bigint;
    status: VendorStatus;
    isEcoDelivery: boolean;
    name: string;
    description: string;
    address: string;
    category: VendorCategory;
}
export interface UserProfile {
    name: string;
    address: string;
    phone: string;
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered"
}
export enum ProductCategory {
    food = "food",
    medicine = "medicine",
    grocery = "grocery",
    pooja = "pooja"
}
export enum StockStatus {
    inStock = "inStock",
    outOfStock = "outOfStock"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VendorCategory {
    grocery = "grocery",
    pharmacy = "pharmacy",
    temple = "temple",
    restaurant = "restaurant"
}
export enum VendorStatus {
    closed = "closed",
    open = "open"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignDriver(orderId: bigint, driverId: Principal): Promise<void>;
    createOrder(order: Order, items: Array<OrderItem>): Promise<bigint>;
    createProduct(product: Product): Promise<bigint>;
    createVendor(vendor: Vendor): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    deleteVendor(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllVendors(): Promise<Array<Vendor>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderById(orderId: bigint): Promise<Order>;
    getOrderItems(orderId: bigint): Promise<Array<OrderItem>>;
    getOrdersByCustomer(customerId: Principal): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProductsByVendor(vendorId: bigint): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendor(id: bigint): Promise<Vendor>;
    getVendorsByCategory(category: VendorCategory): Promise<Array<Vendor>>;
    initializeData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(id: bigint, product: Product): Promise<void>;
    updateVendor(id: bigint, vendor: Vendor): Promise<void>;
}
