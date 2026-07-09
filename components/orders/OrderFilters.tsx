'use client';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const CHANNELS = ['web', 'facebook', 'shopee', 'lazada', 'tiktok', 'manual'];

interface OrderFiltersProps {
  status: string;
  channel: string;
  onStatusChange: (v: string) => void;
  onChannelChange: (v: string) => void;
}

const selectCls = 'border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white';

export function OrderFilters({ status, channel, onStatusChange, onChannelChange }: OrderFiltersProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <select value={status} onChange={e => onStatusChange(e.target.value)} className={selectCls}>
        <option value="">Tất cả trạng thái</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={channel} onChange={e => onChannelChange(e.target.value)} className={selectCls}>
        <option value="">Tất cả kênh</option>
        {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}
