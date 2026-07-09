'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/types/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Product[]>('/products').then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Sản phẩm</h1>
            <span className="text-sm text-neutral-500">{products.length} sản phẩm</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : products.length === 0 ? (
              <p className="text-center py-12 text-neutral-400">Chưa có sản phẩm</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Sản phẩm</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Danh mục</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Variants</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Trạng thái</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            <div className="w-10 h-10 relative rounded overflow-hidden bg-neutral-100 flex-shrink-0">
                              <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                            </div>
                          ) : <div className="w-10 h-10 bg-neutral-100 rounded flex-shrink-0" />}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-neutral-400">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{p.category || '—'}</td>
                      <td className="py-3 px-4 text-neutral-500">{p.variants.length} variant</td>
                      <td className="py-3 px-4"><Badge label={p.status} /></td>
                      <td className="py-3 px-4">
                        <Link href={`/products/${p.id}`} className="text-xs text-neutral-500 hover:text-neutral-900 underline">Quản lý</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
