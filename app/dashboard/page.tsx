// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/api';
import { formatVND, formatDateTime } from '@/lib/format';
import type { Order } from '@/types/api';

const STATUS_VN: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Chuẩn bị',
  shipped: 'Đang giao', delivered: 'Đã nhận', cancelled: 'Đã huỷ', refunded: 'Hoàn tiền',
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Order[]>('/orders').then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const todayRevenue = todayOrders.filter(o => ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const recentOrders = orders.slice(0, 10);

  const columns = [
    { key: 'id', label: 'Đơn', render: (o: Order) => <Link href={`/orders/${o.id}`} className="font-medium hover:underline">#{o.id.slice(0, 8).toUpperCase()}</Link> },
    { key: 'channel', label: 'Kênh', render: (o: Order) => <Badge label={o.channel} /> },
    { key: 'total', label: 'Tổng tiền', render: (o: Order) => formatVND(o.total) },
    { key: 'status', label: 'Trạng thái', render: (o: Order) => <Badge label={o.status} /> },
    { key: 'paymentStatus', label: 'Thanh toán', render: (o: Order) => <Badge label={o.paymentStatus} /> },
    { key: 'createdAt', label: 'Thời gian', render: (o: Order) => formatDateTime(o.createdAt) },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-xl font-semibold mb-6">Tổng quan</h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Đơn hôm nay" value={todayOrders.length} sub={loading ? '...' : undefined} />
            <StatCard label="Chờ xác nhận" value={pendingOrders.length} sub="cần xử lý" />
            <StatCard label="Doanh thu hôm nay" value={loading ? '...' : formatVND(todayRevenue)} />
            <StatCard label="Tổng đơn" value={orders.length} />
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-sm">Đơn hàng gần đây</h2>
              <Link href="/orders" className="text-xs text-neutral-500 hover:text-neutral-900">Xem tất cả →</Link>
            </div>
            <DataTable columns={columns} rows={recentOrders} loading={loading} emptyLabel="Chưa có đơn hàng" />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
