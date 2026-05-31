import type { RawApiNode } from '../types/api'

export function makeNodeSegment(node: RawApiNode | null | undefined, index: number) {
  const id = node?.id !== undefined && node?.id !== null ? String(node.id) : ''
  const name = String(node?.name || node?.title || '').trim()
  return `idx:${index}:${id ? `id:${id}` : name}`
}

export function makeApiKey(node: RawApiNode, idPath: string[], index: number) {
  const method = String(node?.method || '').toUpperCase()
  const url = String(node?.url || '')
  const label = String(node?.name || node?.title || '')
  return [...idPath, makeNodeSegment(node, index), `${method} ${url} ${label}`.trim()].join('/')
}
