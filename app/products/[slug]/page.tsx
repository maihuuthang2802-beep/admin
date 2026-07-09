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

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiFetch<Product>(`/admin/products/${slug}`).then(p => {
      setProduct(p);
      setEditName(p.name);
      setEditDesc(p.description || '');
      setEditCategory(p.category || '');
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  async function updateStatus(status: string) {
    if (!product) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/products/${product.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setProduct(p => p ? { ...p, status: status as any } : p);
    } finally {
      setSaving(false);
    }
  }

  async function saveDetails() {
    if (!product) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Product>(`/admin/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName, description: editDesc, category: editCategory }),
      });
      setProduct(updated);
      setEditing(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!product) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/products/${product.id}`, { method: 'DELETE' });
      router.push('/products');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleVariantUpdated(updated: Variant) {
    setProduct(p => p ? { ...p, variants: p.variants.map(v => v.id === updated.id ? updated : v) } : p);
  }

  if (loading) return <AuthGuard><div className="flex h-screen"><Sidebar /><main className="flex-1 p-6 text-neutral-400">Dang tai...</main></div></AuthGuard>;
  if (!product) return <AuthGuard><div className="flex h-screen"><Sidebar /><main className="flex-1 p-6">Khong tim thay san pham</main></div></AuthGuard>;

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-sm text-neutral-400 hover:text-neutral-900">&larr;</button>
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <Badge label={product.status} />
          </div>

          {deleteConfirm && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <p className="text-sm text-red-700">Xac nhan xoa &quot;{product.name}&quot;? Khong the hoan tac.</p>
              <div className="flex gap-2">
                <button onClick={deleteProduct} disabled={saving}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                  {saving ? 'Dang xoa...' : 'Xoa'}
                </button>
                <button onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:border-neutral-900 transition-colors">
                  Huy
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Edit details */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Chi tiet san pham</h2>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="text-xs text-neutral-500 hover:text-neutral-900 underline">Sua</button>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Ten san pham</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Mo ta</label>
                      <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Danh muc</label>
                      <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveDetails} disabled={saving}
                        className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50">
                        {saving ? 'Dang luu...' : 'Luu'}
                      </button>
                      <button onClick={() => setEditing(false)}
                        className="px-4 py-2 border rounded-lg text-sm hover:border-neutral-900 transition-colors">
                        Huy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-2">
                    <p className="text-neutral-600">{product.description || 'Khong co mo ta'}</p>
                    <p><span className="text-neutral-500">Danh muc:</span> {product.category || '—'}</p>
                  </div>
                )}
              </div>

              {/* Variants */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
                <h2 className="font-semibold mb-4">Ton kho & Gia</h2>
                {product.variants.length === 0 ? (
                  <p className="text-sm text-neutral-400">Chua co variant</p>
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
                <h2 className="font-semibold mb-4">Trang thai san pham</h2>
                <div className="space-y-2">
                  {(['active', 'hidden', 'deleted'] as const).filter(s => s !== product.status).map(s => (
                    <button key={s} onClick={() => updateStatus(s)} disabled={saving}
                      className="w-full text-left px-3 py-2 border rounded-lg text-sm hover:border-neutral-900 transition-colors disabled:opacity-50">
                      &rarr; {s === 'active' ? 'Hien thi' : s === 'hidden' ? 'An' : 'Xoa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-neutral-500">Slug</span><span className="font-mono text-xs">{product.slug}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Danh muc</span><span>{product.category || '—'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Variants</span><span>{product.variants.length}</span></div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tong ton kho</span>
                  <span>{product.variants.reduce((s, v) => s + v.stockQty, 0)}</span>
                </div>
              </div>

              <button onClick={() => setDeleteConfirm(true)} disabled={saving}
                className="w-full text-left px-4 py-3 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                Xoa san pham nay
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
