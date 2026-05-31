import { computed, ref } from 'vue'
import type { FlatApiItem, RawApiNode, RawApiRoot } from '../types/api'
import { buildFlat, countModules } from '../utils/apiTree'
import { readJsonFile } from '../utils/file'

export function useApiDocument() {
  const rawRoot = ref<RawApiRoot | null>(null)
  const flat = ref<FlatApiItem[]>([])
  const nodeMap = ref<Map<RawApiNode, string>>(new Map())
  const fileName = ref('')
  const error = ref('')
  const isParsing = ref(false)

  const apiCount = computed(() => flat.value.length)
  const moduleCount = computed(() => countModules(rawRoot.value?.data || []))
  const hasDocument = computed(() => Boolean(rawRoot.value))

  function reset() {
    rawRoot.value = null
    flat.value = []
    nodeMap.value = new Map()
    fileName.value = ''
    error.value = ''
  }

  async function loadFile(file: File) {
    isParsing.value = true
    error.value = ''
    try {
      const root = await readJsonFile(file)
      const result = buildFlat(root)
      rawRoot.value = root
      flat.value = result.flat
      nodeMap.value = result.nodeMap
      fileName.value = file.name
    } catch (err) {
      reset()
      error.value = err instanceof SyntaxError
        ? `JSON 格式错误：${err.message}`
        : `读取文件失败：${err instanceof Error ? err.message : String(err)}`
    } finally {
      isParsing.value = false
    }
  }

  return {
    rawRoot,
    flat,
    nodeMap,
    fileName,
    error,
    isParsing,
    apiCount,
    moduleCount,
    hasDocument,
    loadFile,
    reset,
  }
}
