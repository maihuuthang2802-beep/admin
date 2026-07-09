'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/api';
import { formatVND, formatDateTime } from '@/lib/format';
import type { Order, Shipment } from '@/types/api';

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PROVIDERS = [{ value: 'ghn', label: 'GHN' }, { value: 'ghtk', label: 'GHTK' }, { value: 'jnt', label: 'J&T' }];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      apiFetch<Order>(`/orders/${id}`),
      apiFetch<Shipment>(`/orders/${id}/shipment`).catch(() => null),
    ]).then(([o, s]) => { setOrder(o); setShipment(s); }).finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    if (!order || statusLoading) return;
    setStatusLoading(true);
    try {
      const updated = await apiFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setOrder(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStatusLoading(false);
    }
  }

  async function createShipment(provider: string) {
    if (!order || shipLoading) return;
    setShipLoading(true);
    try {
      const s = await apiFetch<Shipment>(`/orders/${id}/ship`, { method: 'POST', body: JSON.stringify({ provider }) });
      setShipment(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setShipLoading(false);
    }
  }

  if (loading) return (
    <AuthGuard>
      <div className="flex h-screen"><Sidebar /><main className="flex-1 p-6 text-neutral-400">Đang tải...</main></div>
    </AuthGuard>
  );

  if (!order) return (
    <AuthGuard>
      <div className="flex h-screen"><Sidebar /><main className="flex-1 p-6 text-red-500">Không tìm thấy đơn</main></div>
    </AuthGuard>
  );

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-sm text-neutral-400 hover:text-neutral-900">←</button>
            <h1 className="text-xl font-semibold">Đơn #{order.id.slice(0, 8).toUpperCase()}</h1>
            <Badge label={order.status} />
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Sản phẩm</h2>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-neutral-600">SKU {item.variantId.slice(0, 8)} × {item.qty}</span>
                      <span className="font-medium">{formatVND(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Phí ship</span><span>{formatVND(order.shippingFee)}</span></div>
                  <div className="flex justify-between font-semibold"><span>Tổng</span><span>{formatVND(order.total)}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Vận chuyển</h2>
                {shipment ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-neutral-500">Đơn vị</span><span className="font-medium">{shipment.provider.toUpperCase()}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Mã vận đơn</span><span className="font-mono">{shipment.trackingCode || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Trạng thái</span><Badge label={shipment.status} /></div>
                    {shipment.labelUrl && (
                      <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">In nhãn vận chuyển →</a>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-500 mb-3">Chưa tạo vận đơn.</p>
                    <div className="flex gap-2">
                      {PROVIDERS.map(p => (
                        <button key={p.value} onClick={() => createShipment(p.value)} disabled={shipLoading}
                          className="px-4 py-2 border rounded-lg text-sm hover:border-neutral-900 transition-colors disabled:opacity-50">
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Cập nhật trạng thái</h2>
                <div className="space-y-2">
                  {ALL_STATUSES.filter(s => s !== order.status).map(s => (
                    <button key={s} onClick={() => updateStatus(s)} disabled={statusLoading}
                      className="w-full text-left px-3 py-2 border rounded-lg text-sm hover:border-neutral-900 transition-colors disabled:opacity-50">
                      → {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Thông tin giao hàng</h2>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p className="text-neutral-500">{order.shippingAddress.phone}</p>
                  <p className="text-neutral-500">{order.shippingAddress.address}</p>
                  <p className="text-neutral-500">{order.shippingAddress.district}, {order.shippingAddress.province}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-neutral-500">Kênh</span><Badge label={order.channel} /></div>
                <div className="flex justify-between"><span className="text-neutral-500">Thanh toán</span><span>{order.paymentMethod.toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">TT thanh toán</span><Badge label={order.paymentStatus} /></div>
                <div className="flex justify-between"><span className="text-neutral-500">Ngày tạo</span><span>{formatDateTime(order.createdAt)}</span></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
