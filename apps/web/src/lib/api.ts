const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface ApiOptions {
  method?: string;
  body?: Record<string, unknown> | unknown[];
  token?: string;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

// Auth types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'VIEWER';
    organizationId: string | null;
  };
  accessToken: string;
}

export function login(email: string, password: string) {
  return api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(data: {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}) {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export function getProfile(token: string) {
  return api<AuthResponse['user']>('/auth/me', { token });
}

// Product types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  unitCost: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export function getProducts(token: string) {
  return api<Product[]>('/products', { token });
}

export function getProduct(token: string, id: string) {
  return api<Product>(`/products/${id}`, { token });
}

export function createProduct(token: string, data: Partial<Product>) {
  return api<Product>('/products', { method: 'POST', body: data as Record<string, unknown>, token });
}

export function updateProduct(token: string, id: string, data: Partial<Product>) {
  return api<Product>(`/products/${id}`, { method: 'PATCH', body: data as Record<string, unknown>, token });
}

export function deleteProduct(token: string, id: string) {
  return api<{ deleted: boolean }>(`/products/${id}`, { method: 'DELETE', token });
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  rating: number | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { orders: number };
}

export function getSuppliers(token: string) {
  return api<Supplier[]>('/suppliers', { token });
}

export function getSupplier(token: string, id: string) {
  return api<Supplier>(`/suppliers/${id}`, { token });
}

export function createSupplier(token: string, data: Partial<Supplier>) {
  return api<Supplier>('/suppliers', { method: 'POST', body: data as Record<string, unknown>, token });
}

export function updateSupplier(token: string, id: string, data: Partial<Supplier>) {
  return api<Supplier>(`/suppliers/${id}`, { method: 'PATCH', body: data as Record<string, unknown>, token });
}

export function deleteSupplier(token: string, id: string) {
  return api<{ deleted: boolean }>(`/suppliers/${id}`, { method: 'DELETE', token });
}

// Order types
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; sku: string; name: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  notes: string | null;
  supplier: { id: string; name: string } | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export function getOrders(token: string) {
  return api<Order[]>('/orders', { token });
}

export function getOrder(token: string, id: string) {
  return api<Order>(`/orders/${id}`, { token });
}

export function createOrder(
  token: string,
  data: {
    supplierId: string;
    notes?: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
  },
) {
  return api<Order>('/orders', { method: 'POST', body: data as unknown as Record<string, unknown>, token });
}

export function updateOrderStatus(token: string, id: string, status: Order['status']) {
  return api<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token });
}

export function deleteOrder(token: string, id: string) {
  return api<{ deleted: boolean }>(`/orders/${id}`, { method: 'DELETE', token });
}

// Dashboard types
export interface DashboardStats {
  inventoryValue: number;
  pendingOrders: number;
  totalOrders: number;
  activeSuppliers: number;
  totalOrderValue: number;
  productCount: number;
  alerts: {
    id: string;
    sku: string;
    name: string;
    type: 'critical' | 'low_stock' | 'overstock' | 'optimal';
    message: string;
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
  }[];
}

export function getDashboardStats(token: string) {
  return api<DashboardStats>('/dashboard/stats', { token });
}

// Analytics types
export interface KpiSummary {
  totalInventoryValue: number;
  totalOrderValue: number;
  avgOrderValue: number;
  fulfillmentRate: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSuppliers: number;
  avgSupplierRating: number;
  totalOrders: number;
  deliveredOrders: number;
  totalItemsOrdered: number;
}

export interface SupplierPerformance {
  id: string;
  name: string;
  rating: number | null;
  totalOrders: number;
  deliveredOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  fulfillmentRate: number;
  onTimeDelivery: number;
  activeStatus: string;
}

export interface InventoryTurnover {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  unitCost: number;
  totalSold: number;
  turnoverRate: number;
  daysOfSupply: number;
  stockValue: number;
  stockHealth: string;
}

export interface CashFlowTrends {
  monthlyTrends: { month: string; totalSpend: number; orderCount: number; avgOrderSize: number }[];
  summary: { totalSpend: number; avgMonthlySpend: number; totalOrders: number; monthsCovered: number };
}

export function getKpis(token: string) {
  return api<KpiSummary>('/analytics/kpis', { token });
}

export function getSupplierPerformance(token: string) {
  return api<SupplierPerformance[]>('/analytics/supplier-performance', { token });
}

export function getInventoryTurnover(token: string) {
  return api<InventoryTurnover[]>('/analytics/inventory-turnover', { token });
}

export function getCashFlow(token: string) {
  return api<CashFlowTrends>('/analytics/cash-flow', { token });
}

export function exportReport(token: string) {
  return api<Record<string, unknown>>('/analytics/export', { token });
}

// Shopify integration
export interface ShopifyStatus {
  configured: boolean;
  storeUrl: string | null;
}

export function getShopifyStatus(token: string) {
  return api<ShopifyStatus>('/integrations/shopify/status', { token });
}

export function syncShopifyProducts(token: string) {
  return api<{ synced: number; message: string }>('/integrations/shopify/sync-products', {
    method: 'POST',
    token,
  });
}

export function getShopifySalesTrends(token: string) {
  return api<{ source: string; trends: { month: string; revenue: number; orders: number; units: number }[] }>(
    '/integrations/shopify/sales-trends',
    { token },
  );
}

// Notifications
export interface NotificationStatus {
  configured: boolean;
  senderEmail: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
}

export function getNotificationStatus(token: string) {
  return api<NotificationStatus>('/notifications/status', { token });
}

export function getEmailTemplates(token: string) {
  return api<EmailTemplate[]>('/notifications/templates', { token });
}

export function sendRfqEmail(
  token: string,
  data: { supplierId: string; products: { name: string; quantity: number }[]; notes?: string },
) {
  return api<{ sent: boolean; message: string; preview: string }>('/notifications/rfq', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
    token,
  });
}

export function sendOrderConfirmation(token: string, orderId: string) {
  return api<{ sent: boolean; message: string; preview: string }>('/notifications/order-confirmation', {
    method: 'POST',
    body: { orderId },
    token,
  });
}

export function sendPaymentReminder(token: string, orderId: string) {
  return api<{ sent: boolean; message: string; preview: string }>('/notifications/payment-reminder', {
    method: 'POST',
    body: { orderId },
    token,
  });
}
