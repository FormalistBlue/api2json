import type { RawApiRoot } from '../types/api'

export async function readJsonFile(file: File): Promise<RawApiRoot> {
  const text = await file.text()
  return JSON.parse(text) as RawApiRoot
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
