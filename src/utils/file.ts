import type { RawApiRoot } from '../types/api'

function validateApiRoot(data: unknown): data is RawApiRoot {
  if (!data || typeof data !== 'object') {
    throw new Error('JSON 文件内容为空或不是对象')
  }
  const root = data as Record<string, unknown>
  if (!Array.isArray(root.data)) {
    throw new Error('JSON 缺少 "data" 数组字段。请确认文件是从 DOClever 导出的 API 文档。')
  }
  if (root.data.length === 0) {
    throw new Error('"data" 数组为空，文件中没有 API 模块。')
  }
  // Quick sanity: first top-level node should look like a module or API
  const first = root.data[0] as Record<string, unknown>
  if (!first || typeof first !== 'object') {
    throw new Error('data[0] 不是有效对象，JSON 结构可能损坏。')
  }
  if (!('name' in first) && !('title' in first) && !('data' in first) && !('url' in first)) {
    throw new Error('data[0] 缺少 name/title/data/url 字段，不像是 DOClever API 导出格式。')
  }
  return true
}

export async function readJsonFile(file: File): Promise<RawApiRoot> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (err) {
    throw new SyntaxError(err instanceof Error ? err.message : 'JSON 解析失败')
  }
  validateApiRoot(data)
  return data as RawApiRoot
}

export function downloadJson(obj: unknown, filename = 'api_export_selected.json') {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function copyJson(obj: unknown) {
  await navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
}
