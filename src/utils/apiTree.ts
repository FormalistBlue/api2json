import type { FlatApiItem, RawApiNode, RawApiRoot } from '../types/api'
import { makeApiKey, makeNodeSegment } from './key'

export function isApiNode(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const candidate = node as RawApiNode
  if (Array.isArray(candidate.data) && candidate.data.length > 0) return false
  if (candidate.url !== undefined || candidate.method !== undefined) return true
  if (Array.isArray(candidate.param)) return true
  return false
}

export function countApis(node: RawApiNode): number {
  if (isApiNode(node)) return 1
  if (!Array.isArray(node?.data)) return 0
  return node.data.reduce((sum, child) => sum + countApis(child), 0)
}

export function countModules(nodes: RawApiNode[] = []): number {
  let total = 0
  for (const node of nodes) {
    if (!isApiNode(node) && Array.isArray(node.data) && countApis(node) > 0) {
      total += 1
      total += countModules(node.data)
    }
  }
  return total
}

export function buildFlat(root: RawApiRoot): FlatApiItem[] {
  const flat: FlatApiItem[] = []
  const modules = Array.isArray(root?.data) ? root.data : []
  modules.forEach((node, index) => walkNode(node, [], [], index, flat))
  return flat
}

function walkNode(
  node: RawApiNode,
  idPath: string[],
  namePath: string[],
  index: number,
  flat: FlatApiItem[],
) {
  if (!node || typeof node !== 'object') return
  const nodeName = String(node.name ?? '')

  if (isApiNode(node)) {
    flat.push({
      path: [...idPath],
      pathNames: [...namePath],
      api: node,
      key: makeApiKey(node, idPath, index),
    })
    return
  }

  if (Array.isArray(node.data)) {
    const newIdPath = [...idPath, makeNodeSegment(node, index)]
    const newNamePath = [...namePath, nodeName]
    node.data.forEach((child, childIndex) => walkNode(child, newIdPath, newNamePath, childIndex, flat))
  }
}

export function findFlatKeyForNode(flat: FlatApiItem[], node: RawApiNode) {
  return flat.find((item) => item.api === node)?.key || ''
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function filterTree(nodes: RawApiNode[] = [], selectedKeys: Set<string>, flat: FlatApiItem[]) {
  const result: RawApiNode[] = []

  for (const node of nodes) {
    if (isApiNode(node)) {
      const key = findFlatKeyForNode(flat, node)
      if (key && selectedKeys.has(key)) result.push(cloneJson(node))
      continue
    }

    if (Array.isArray(node.data)) {
      const filteredChildren = filterTree(node.data, selectedKeys, flat)
      if (filteredChildren.length > 0) {
        const nodeCopy = cloneJson(node)
        nodeCopy.data = filteredChildren
        result.push(nodeCopy)
      }
    }
  }

  return result
}

export function buildExportRoot(rawRoot: RawApiRoot, selectedKeys: Set<string>, flat: FlatApiItem[]) {
  const out = cloneJson(rawRoot)
  out.data = filterTree(rawRoot.data || [], selectedKeys, flat)
  return out
}

export function groupSelectionState(node: RawApiNode, selectedKeys: Set<string>, flat: FlatApiItem[]) {
  const keys: string[] = []
  collectKeys(node, flat, keys)
  const selected = keys.filter((key) => selectedKeys.has(key)).length
  return {
    total: keys.length,
    selected,
    checked: keys.length > 0 && selected === keys.length,
    indeterminate: selected > 0 && selected < keys.length,
  }
}

export function collectKeys(node: RawApiNode, flat: FlatApiItem[], keys: string[]) {
  if (isApiNode(node)) {
    const key = findFlatKeyForNode(flat, node)
    if (key) keys.push(key)
    return
  }
  if (Array.isArray(node.data)) node.data.forEach((child) => collectKeys(child, flat, keys))
}
