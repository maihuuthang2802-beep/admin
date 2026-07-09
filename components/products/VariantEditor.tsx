'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatVND } from '@/lib/format';
import type { Variant } from '@/types/api';

export function VariantEditor({ variant, onUpdated }: { variant: Variant; onUpdated: (v: Variant) => void }) {
  const [editing, setEditing] = useState(false);
  const [stockQty, setStockQty] = useState(variant.stockQty);
  const [price, setPrice] = useState(variant.price);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await apiFetch<Variant>(`/admin/variants/${variant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stockQty: Number(stockQty), price: Number(price) }),
      });
      onUpdated(updated);
      setEditing(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  const available = variant.stockQty - variant.reservedQty;

  return (
    <div className="flex items-center justify-between py-2.5 border-b text-sm">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{variant.sku}</span>
        <span className="text-neutral-500">{[variant.size, variant.color].filter(Boolean).join(' / ') || 'Default'}</span>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input type="number" value={stockQty} onChange={e => setStockQty(Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-sm" placeholder="Tồn kho" />
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-28 border rounded px-2 py-1 text-sm" placeholder="Giá" />
          <button onClick={save} disabled={saving} className="bg-neutral-900 text-white px-3 py-1 rounded text-xs disabled:opacity-50">Lưu</button>
          <button onClick={() => setEditing(false)} className="text-neutral-500 text-xs">Huỷ</button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className={available <= 0 ? 'text-red-500' : available <= 5 ? 'text-yellow-600' : 'text-green-600'}>
            {available}/{variant.stockQty} còn lại
          </span>
          <span>{formatVND(variant.price)}</span>
          <button onClick={() => setEditing(true)} className="text-xs text-neutral-500 hover:text-neutral-900 underline">Sửa</button>
        </div>
      )}
    </div>
  );
}
