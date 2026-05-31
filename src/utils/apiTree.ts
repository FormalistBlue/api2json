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

export function buildFlat(root: RawApiRoot): { flat: FlatApiItem[]; nodeMap: Map<RawApiNode, string> } {
  const flat: FlatApiItem[] = []
  const nodeMap = new Map<RawApiNode, string>()
  const modules = Array.isArray(root?.data) ? root.data : []
  modules.forEach((node, index) => walkNode(node, [], [], index, flat, nodeMap))
  return { flat, nodeMap }
}

function walkNode(
  node: RawApiNode,
  idPath: string[],
  namePath: string[],
  index: number,
  flat: FlatApiItem[],
  nodeMap: Map<RawApiNode, string>,
) {
  if (!node || typeof node !== 'object') return
  const nodeName = String(node.name ?? '')

  if (isApiNode(node)) {
    const key = makeApiKey(node, idPath)
    nodeMap.set(node, key)
    flat.push({
      path: [...idPath],
      pathNames: [...namePath],
      api: node,
      key,
    })
    return
  }

  if (Array.isArray(node.data)) {
    const newIdPath = [...idPath, makeNodeSegment(node, index)]
    const newNamePath = [...namePath, nodeName]
    node.data.forEach((child, childIndex) => walkNode(child, newIdPath, newNamePath, childIndex, flat, nodeMap))
  }
}

/** O(1) lookup via Map — nodeMap must come from buildFlat */
export function findFlatKeyForNode(nodeMap: Map<RawApiNode, string>, node: RawApiNode) {
  return nodeMap.get(node) || ''
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function filterTree(nodes: RawApiNode[] = [], selectedKeys: Set<string>, nodeMap: Map<RawApiNode, string>) {
  const result: RawApiNode[] = []

  for (const node of nodes) {
    if (isApiNode(node)) {
      const key = nodeMap.get(node)
      if (key && selectedKeys.has(key)) result.push(cloneJson(node))
      continue
    }

    if (Array.isArray(node.data)) {
      const filteredChildren = filterTree(node.data, selectedKeys, nodeMap)
      if (filteredChildren.length > 0) {
        const nodeCopy = cloneJson(node)
        nodeCopy.data = filteredChildren
        result.push(nodeCopy)
      }
    }
  }

  return result
}

export function buildExportRoot(rawRoot: RawApiRoot, selectedKeys: Set<string>, nodeMap: Map<RawApiNode, string>) {
  const out = cloneJson(rawRoot)
  out.data = filterTree(rawRoot.data || [], selectedKeys, nodeMap)
  return out
}

export function groupSelectionState(node: RawApiNode, selectedKeys: Set<string>, nodeMap: Map<RawApiNode, string>) {
  const keys: string[] = []
  collectKeys(node, nodeMap, keys)
  const selected = keys.filter((key) => selectedKeys.has(key)).length
  return {
    total: keys.length,
    selected,
    checked: keys.length > 0 && selected === keys.length,
    indeterminate: selected > 0 && selected < keys.length,
  }
}

export function collectKeys(node: RawApiNode, nodeMap: Map<RawApiNode, string>, keys: string[]) {
  if (isApiNode(node)) {
    const key = nodeMap.get(node)
    if (key) keys.push(key)
    return
  }
  if (Array.isArray(node.data)) node.data.forEach((child) => collectKeys(child, nodeMap, keys))
}
