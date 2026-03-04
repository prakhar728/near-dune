'use client'

import type { DuneRow } from '@/lib/dune'

interface Column {
  key: string
  label: string
  format?: (val: string | number | boolean | null) => string
  align?: 'left' | 'right'
}

export function DataTable({
  columns,
  rows,
  maxRows = 20,
}: {
  columns: Column[]
  rows: DuneRow[]
  maxRows?: number
}) {
  const visible = rows.slice(0, maxRows)
  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === 'right' ? 'text-right' : 'text-left'}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={i} className="transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${col.align === 'right' ? 'text-right tabular-nums font-mono text-[0.8125rem]' : 'text-left'}`}
                >
                  {col.format
                    ? col.format(row[col.key])
                    : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p className="mt-3 text-center text-[0.6875rem] text-[var(--text-dimmed)]">
          Showing {maxRows} of {rows.length} rows
        </p>
      )}
    </div>
  )
}
