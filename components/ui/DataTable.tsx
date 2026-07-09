import { Skeleton } from './Skeleton';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  keyField?: string;
  emptyLabel?: string;
}

export function DataTable<T extends Record<string, any>>({ columns, rows, loading, keyField = 'id', emptyLabel = 'Không có dữ liệu' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map(col => (
              <th key={col.key} className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b">
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
              ))}
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={columns.length} className="text-center py-8 text-neutral-400">{emptyLabel}</td></tr>
          )}
          {!loading && rows.map(row => (
            <tr key={row[keyField]} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
