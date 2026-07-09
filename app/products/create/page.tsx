'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/types/api';

interface VariantEntry {
  sku: string;
  size: string;
  color: string;
  price: number;
  stockQty: number;
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CreateProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [variants, setVariants] = useState<VariantEntry[]>([
    { sku: '', size: '', color: '', price: 0, stockQty: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(val: string) {
    setName(val);
    if (!slug || slug === toSlug(name)) {
      setSlug(toSlug(val));
    }
  }

  function updateVariant(i: number, field: keyof VariantEntry, val: string | number) {
    setVariants(vs => vs.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  }

  function addVariant() {
    setVariants(vs => [...vs, { sku: '', size: '', color: '', price: 0, stockQty: 0 }]);
  }

  function removeVariant(i: number) {
    setVariants(vs => vs.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nhap ten san pham'); return; }
    if (!slug.trim()) { setError('Nhap slug'); return; }
    if (variants.some(v => !v.sku.trim())) { setError('Tat ca variant can co SKU'); return; }
    setSaving(true);
    setError('');
    try {
      const product = await apiFetch<Product>('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
          images: imagesInput ? imagesInput.split('\n').map(s => s.trim()).filter(Boolean) : [],
          variants: variants.map(v => ({ ...v, price: Number(v.price), stockQty: Number(v.stockQty) })),
        }),
      });
      router.push(`/products/${product.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900';

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-sm text-neutral-400 hover:text-neutral-900">&larr;</button>
            <h1 className="text-xl font-semibold">Them san pham</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

            <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5 space-y-4">
              <h2 className="font-semibold">Thong tin co ban</h2>
              <div>
                <label className="text-xs font-medium block mb-1">Ten san pham</label>
                <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Slug</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mo ta</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Danh muc</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Hinh anh (URLs, moi dong 1 URL)</label>
                <textarea value={imagesInput} onChange={e => setImagesInput(e.target.value)} rows={3} className={`${inputCls} resize-none font-mono text-xs`} placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg" />
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Variants</h2>
                <button type="button" onClick={addVariant}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline">+ Them variant</button>
              </div>
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-end gap-2 pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <label className="text-xs text-neutral-500 block mb-0.5">SKU</label>
                      <input type="text" value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} required className={`${inputCls} font-mono text-xs`} />
                    </div>
                    <div className="w-16">
                      <label className="text-xs text-neutral-500 block mb-0.5">Size</label>
                      <input type="text" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} className={inputCls} />
                    </div>
                    <div className="w-20">
                      <label className="text-xs text-neutral-500 block mb-0.5">Mau</label>
                      <input type="text" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} className={inputCls} />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-neutral-500 block mb-0.5">Gia</label>
                      <input type="number" value={v.price || ''} onChange={e => updateVariant(i, 'price', Number(e.target.value))} required className={inputCls} />
                    </div>
                    <div className="w-20">
                      <label className="text-xs text-neutral-500 block mb-0.5">Ton kho</label>
                      <input type="number" value={v.stockQty || ''} onChange={e => updateVariant(i, 'stockQty', Number(e.target.value))} required className={inputCls} />
                    </div>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(i)}
                        className="text-red-500 text-xs pb-1 hover:underline">Xoa</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-neutral-700 transition-colors disabled:opacity-50">
                {saving ? 'Dang tao...' : 'Tao san pham'}
              </button>
              <button type="button" onClick={() => router.back()}
                className="px-6 py-3 border rounded-lg text-sm hover:border-neutral-900 transition-colors">
                Huy
              </button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
