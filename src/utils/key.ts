import type { RawApiNode } from '../types/api'

export function makeNodeSegment(node: RawApiNode | null | undefined, index: number) {
  const id = node?.id !== undefined && node?.id !== null ? String(node.id) : ''
  const name = String(node?.name || node?.title || '').trim()
  return `idx:${index}:${id ? `id:${id}` : name}`
}

/** Stable API key based on node identity, not array position */
export function makeApiKey(node: RawApiNode, idPath: string[]) {
  const method = String(node?.method || '').toUpperCase()
  const url = String(node?.url || '')
  const label = String(node?.name || node?.title || '')
  const nodeId = node?.id !== undefined && node?.id !== null ? String(node.id) : ''
  const tail = `${method} ${url} ${label} ${nodeId}`.trim()
  return [...idPath, tail].join('/')
}
