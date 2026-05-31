import type { FlatApiItem, RawApiNode } from '../types/api'
import { isApiNode } from './apiTree'

export function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

export function matchApi(item: FlatApiItem, query: string) {
  const q = normalizeQuery(query)
  if (!q) return true
  const title = String(item.api?.title ?? '')
  const name = String(item.api?.name ?? '')
  const url = String(item.api?.url ?? '')
  const method = String(item.api?.method ?? '')
  const pathStr = item.pathNames.join(' ')
  return `${pathStr} ${name} ${title} ${url} ${method}`.toLowerCase().includes(q)
}

export function matchGroup(node: RawApiNode, query: string) {
  const q = normalizeQuery(query)
  if (!q) return true
  const nodeName = String(node.name ?? '').toLowerCase()
  if (nodeName.includes(q)) return true

  if (!Array.isArray(node.data)) return false
  for (const child of node.data) {
    if (isApiNode(child)) {
      const hay = `${child.name || ''} ${child.title || ''} ${child.url || ''} ${child.method || ''}`.toLowerCase()
      if (hay.includes(q)) return true
    } else if (matchGroup(child, q)) {
      return true
    }
  }
  return false
}
