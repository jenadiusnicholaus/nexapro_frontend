export function toCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return ''
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((fieldName) => JSON.stringify(row[fieldName])).join(',')
    ),
  ].join('\r\n')
  return csv
}

export function downloadAsCSV(data: Record<string, unknown>[], filename: string): void {
  const csv = toCSV(data)
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(link.href)
}
