'use client';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable } from '@/components/ui/DataTable';
import { apiFetch } from '@/lib/api';
import { formatVND, formatDateTime } from '@/lib/format';
import type { Customer } from '@/types/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch<Customer[]>('/customers').then(setCustomers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    !search || c.phone.includes(search) || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Khách', render: (c: Customer) => <div><p className="font-medium">{c.name || '—'}</p><p className="text-xs text-neutral-400">{c.phone}</p></div> },
    { key: 'totalOrders', label: 'Tổng đơn', render: (c: Customer) => c.totalOrders },
    { key: 'totalSpent', label: 'Tổng chi tiêu', render: (c: Customer) => <span className="font-medium">{formatVND(c.totalSpent)}</span> },
    { key: 'lastOrderAt', label: 'Mua gần nhất', render: (c: Customer) => c.lastOrderAt ? formatDateTime(c.lastOrderAt) : '—' },
    { key: 'tags', label: 'Tags', render: (c: Customer) => (
      <div className="flex gap-1 flex-wrap">
        {c.tags.map(t => <span key={t} className="bg-neutral-100 text-neutral-600 text-xs px-1.5 py-0.5 rounded-full">{t}</span>)}
      </div>
    )},
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Khách hàng</h1>
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 w-64"
            />
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border">
            <DataTable columns={columns} rows={filtered} loading={loading} emptyLabel="Chưa có khách hàng" />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
