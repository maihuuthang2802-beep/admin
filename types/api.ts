// types/api.ts
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cod' | 'vnpay' | 'momo';
export type OrderChannel = 'web' | 'facebook' | 'shopee' | 'lazada' | 'tiktok' | 'manual';

export interface OrderItem {
  id: string;
  variantId: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  channel: OrderChannel;
  customerId: string;
  status: OrderStatus;
  shippingAddress: { name: string; phone: string; address: string; district: string; province: string };
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  notes: string | null;
  items: OrderItem[];
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stockQty: number;
  reservedQty: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  images: string[];
  status: 'active' | 'hidden' | 'deleted';
  variants: Variant[];
  createdAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  tags: string[];
  notes: string | null;
}

export interface Shipment {
  id: string;
  orderId: string;
  provider: 'ghn' | 'ghtk' | 'jnt';
  trackingCode: string | null;
  status: string;
  fee: number;
  labelUrl: string | null;
}
