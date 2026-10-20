// Definicje pól edytowalnych w panelu – wspólne dla bloków stron i danych firmy.
// Bez zależności od bazy: importuje je zarówno serwer, jak i edytor w przeglądarce.

export type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'image' | 'boolean'; hint?: string }
  | { key: string; label: string; type: 'select'; hint?: string; options: { value: string; label: string }[] }
  | { key: string; label: string; type: 'strings'; hint?: string; itemLabel?: string }
  | { key: string; label: string; type: 'list'; hint?: string; itemLabel: string; fields: Field[] }

export type Values = Record<string, unknown>

const MAX_TEXT = 10000
const MAX_ITEMS = 60

export function emptyValue(field: Field): unknown {
  if (field.type === 'strings' || field.type === 'list') return []
  if (field.type === 'boolean') return false
  if (field.type === 'select') return field.options[0]?.value ?? ''
  return ''
}

// Zostawia tylko pola zdefiniowane w schemacie – chroni bazę przed dowolnym JSON-em z zewnątrz.
export function sanitizeField(field: Field, value: unknown): unknown {
  switch (field.type) {
    case 'boolean':
      return typeof value === 'boolean' ? value : undefined
    case 'select':
      return field.options.some((o) => o.value === value) ? value : undefined
    case 'strings':
      return Array.isArray(value)
        ? value.filter((v) => typeof v === 'string').slice(0, MAX_ITEMS).map((v) => (v as string).slice(0, MAX_TEXT))
        : undefined
    case 'list':
      if (!Array.isArray(value)) return undefined
      return value.slice(0, MAX_ITEMS).map((item) => sanitizeValues(field.fields, item))
    default:
      return typeof value === 'string' ? value.slice(0, MAX_TEXT) : undefined
  }
}

export function sanitizeValues(fields: Field[], input: unknown): Values {
  const source = (input && typeof input === 'object' ? input : {}) as Values
  const out: Values = {}
  for (const field of fields) {
    const v = sanitizeField(field, source[field.key])
    if (v !== undefined) out[field.key] = v
  }
  return out
}

// Zapisane wartości nadpisują domyślne pole po polu; listy zastępują się w całości.
export function mergeValues<T extends Values>(defaults: T, stored: unknown): T {
  const result = structuredClone(defaults) as Values
  if (!stored || typeof stored !== 'object') return result as T
  for (const [key, value] of Object.entries(stored as Values)) {
    if (key in result && value !== undefined && value !== null) result[key] = value
  }
  return result as T
}
