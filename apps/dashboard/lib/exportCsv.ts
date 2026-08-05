export interface CsvColumn<T> {
  header: string
  value: (row: T) => string | number | null | undefined
}

/**
 * Builds a CSV from `rows` using `columns` and triggers a browser download.
 * Client-side only — no backend export endpoint, matching how every export
 * button in this dashboard has worked so far (the data is already loaded
 * into the table it's exporting).
 */
export function exportToCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const headers = columns.map((c) => c.header)
  const body = rows.map((row) => columns.map((c) => c.value(row) ?? ''))
  const csv = [headers, ...body]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
