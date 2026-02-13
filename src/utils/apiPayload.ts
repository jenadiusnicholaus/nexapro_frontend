/**
 * Normalize values for API payloads (e.g. ensure FK fields are IDs).
 */

export function getEntityId(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value !== 'object') return null
  const o = value as Record<string, unknown>
  // VaSelect options use { value, text }; API/backend often use { id }
  if (o.value != null && typeof o.value === 'number') return Number(o.value)
  if (o.id != null) return Number(o.id)
  return null
}

/**
 * Build a payload for create/update, ensuring FK fields are sent as IDs
 * and stripping undefined so we don't send undefined to the API.
 */
export function buildPayload<T extends Record<string, unknown>>(
  data: T,
  idFields: (keyof T)[] = []
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue
    if (idFields.includes(key as keyof T)) {
      const id = getEntityId(val)
      if (id != null) out[key] = id
      else if (val === null || val === '') out[key] = null
    } else {
      out[key] = val
    }
  }
  return out
}
