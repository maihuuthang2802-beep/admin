'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCard } from '@/components/ui/StatCard';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { apiFetch } from '@/lib/api';
import { formatVND } from '@/lib/format';
import type { Order } from '@/types/api';

export default function ReportsPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'staff') { router.push('/dashboard'); return; }
    apiFetch<Order[]>('/orders').then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [role, router]);

  // Build last 30 days chart data
  const chartData = (() => {
    const days: Record<string, { revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      days[key] = { revenue: 0, orders: 0 };
    }
    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    orders.filter(o => validStatuses.includes(o.status)).forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (days[key]) { days[key].revenue += Number(o.total); days[key].orders += 1; }
    });
    return Object.entries(days).map(([date, v]) => ({ date, ...v }));
  })();

  const totalRevenue = orders.filter(o => ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const byChannel = orders.reduce((acc, o) => { acc[o.channel] = (acc[o.channel] || 0) + Number(o.total); return acc; }, {} as Record<string, number>);

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-xl font-semibold mb-6">Báo cáo</h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Tổng doanh thu" value={loading ? '...' : formatVND(totalRevenue)} />
            <StatCard label="Tổng đơn" value={orders.length} />
            <StatCard label="Kênh chính" value={Object.entries(byChannel).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'} />
            <StatCard label="Đơn trung bình" value={orders.length ? formatVND(totalRevenue / orders.length) : '—'} />
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5 mb-6">
            <h2 className="font-semibold mb-4">Doanh thu 30 ngày qua</h2>
            {loading ? <div className="h-64 bg-neutral-100 rounded animate-pulse" /> : <RevenueChart data={chartData} />}
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Doanh thu theo kênh</h2>
            <div className="space-y-3">
              {Object.entries(byChannel).sort((a, b) => b[1] - a[1]).map(([channel, rev]) => {
                const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
                return (
                  <div key={channel}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{channel}</span>
                      <span className="font-medium">{formatVND(rev)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
