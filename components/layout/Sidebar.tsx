// components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
  { href: '/orders', label: 'Đơn hàng', icon: '📦' },
  { href: '/products', label: 'Sản phẩm', icon: '👕' },
  { href: '/customers', label: 'Khách hàng', icon: '👥' },
];

const ADMIN_ONLY = [
  { href: '/reports', label: 'Báo cáo', icon: '📈' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, role } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const linkCls = (href: string) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      pathname.startsWith(href)
        ? 'bg-neutral-900 text-white'
        : 'text-neutral-600 hover:bg-neutral-100'
    }`;

  const allItems = role === 'admin' ? [...NAV_ITEMS, ...ADMIN_ONLY] : NAV_ITEMS;

  return (
    <aside className="w-56 border-r h-screen flex flex-col bg-white dark:bg-neutral-950">
      <div className="px-4 py-5 border-b">
        <p className="font-semibold text-sm">LocalBrand Admin</p>
        <p className="text-xs text-neutral-400 mt-0.5">{role}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {allItems.map(item => (
          <Link key={item.href} href={item.href} className={linkCls(item.href)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100 transition-colors">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
