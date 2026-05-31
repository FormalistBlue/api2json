export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ANY' | string

export interface RawApiNode {
  id?: string | number | null
  name?: string
  title?: string
  url?: string
  method?: ApiMethod
  param?: unknown[]
  data?: RawApiNode[]
  [key: string]: unknown
}

export interface RawApiRoot {
  data?: RawApiNode[]
  [key: string]: unknown
}

export interface FlatApiItem {
  path: string[]
  pathNames: string[]
  api: RawApiNode
  key: string
}

export interface ParseResult {
  root: RawApiRoot
  flat: FlatApiItem[]
  moduleCount: number
  apiCount: number
  nodeMap: Map<RawApiNode, string>
}
