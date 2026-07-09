'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { apiFetch } from '@/lib/api';
import { formatVND, formatDateTime } from '@/lib/format';
import type { Order } from '@/types/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch<Order[]>('/orders').then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o =>
    (!statusFilter || o.status === statusFilter) &&
    (!channelFilter || o.channel === channelFilter)
  );

  const columns = [
    { key: 'id', label: 'Mã đơn', render: (o: Order) => <Link href={`/orders/${o.id}`} className="font-mono font-medium hover:underline">#{o.id.slice(0, 8).toUpperCase()}</Link> },
    { key: 'customer', label: 'Khách', render: (o: Order) => <span>{o.shippingAddress?.name || '—'}<br /><span className="text-neutral-400 text-xs">{o.shippingAddress?.phone}</span></span> },
    { key: 'channel', label: 'Kênh', render: (o: Order) => <Badge label={o.channel} /> },
    { key: 'total', label: 'Tổng tiền', render: (o: Order) => <span className="font-medium">{formatVND(o.total)}</span> },
    { key: 'paymentMethod', label: 'TT', render: (o: Order) => o.paymentMethod.toUpperCase() },
    { key: 'status', label: 'Trạng thái', render: (o: Order) => <Badge label={o.status} /> },
    { key: 'createdAt', label: 'Thời gian', render: (o: Order) => formatDateTime(o.createdAt) },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Đơn hàng</h1>
            <span className="text-sm text-neutral-500">{filtered.length} đơn</span>
          </div>
          <div className="mb-4">
            <OrderFilters status={statusFilter} channel={channelFilter} onStatusChange={setStatusFilter} onChannelChange={setChannelFilter} />
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border">
            <DataTable columns={columns} rows={filtered} loading={loading} emptyLabel="Không có đơn hàng" />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
