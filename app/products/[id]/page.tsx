'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { VariantEditor } from '@/components/products/VariantEditor';
import { apiFetch } from '@/lib/api';
import type { Product, Variant } from '@/types/api';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiFetch<Product[]>('/products').then(ps => {
      setProduct(ps.find(p => p.id === id) || null);
    }).finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    if (!product) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setProduct(p => p ? { ...p, status: status as any } : p);
    } finally {
      setSaving(false);
    }
  }

  function handleVariantUpdated(updated: Variant) {
    setProduct(p => p ? { ...p, variants: p.variants.map(v => v.id === updated.id ? updated : v) } : p);
  }

  if (loading) return <AuthGuard><div className="flex h-screen"><Sidebar /><main className="flex-1 p-6 text-neutral-400">Đang tải...</main></div></AuthGuard>;
  if (!product) return <AuthGuard><div className="flex h-screen"><Sidebar /><main className="flex-1 p-6">Không tìm thấy sản phẩm</main></div></AuthGuard>;

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-sm text-neutral-400 hover:text-neutral-900">←</button>
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <Badge label={product.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Tồn kho & Giá</h2>
                {product.variants.length === 0 ? (
                  <p className="text-sm text-neutral-400">Chưa có variant</p>
                ) : (
                  <div>
                    {product.variants.map(v => (
                      <VariantEditor key={v.id} variant={v} onUpdated={handleVariantUpdated} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Trạng thái sản phẩm</h2>
                <div className="space-y-2">
                  {(['active', 'hidden', 'deleted'] as const).filter(s => s !== product.status).map(s => (
                    <button key={s} onClick={() => updateStatus(s)} disabled={saving}
                      className="w-full text-left px-3 py-2 border rounded-lg text-sm hover:border-neutral-900 transition-colors disabled:opacity-50">
                      → {s === 'active' ? 'Hiển thị' : s === 'hidden' ? 'Ẩn' : 'Xoá'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-neutral-500">Slug</span><span className="font-mono text-xs">{product.slug}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Danh mục</span><span>{product.category || '—'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Variants</span><span>{product.variants.length}</span></div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tổng tồn kho</span>
                  <span>{product.variants.reduce((s, v) => s + v.stockQty, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
