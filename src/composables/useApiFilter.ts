import { computed, ref, watch, type Ref } from 'vue'
import type { FlatApiItem } from '../types/api'
import { matchApi } from '../utils/search'

export function useApiFilter(flat: Ref<FlatApiItem[]>) {
  const query = ref('')
  const debouncedQuery = ref('')
  const showCheckedOnly = ref(false)
  const selectedApiKeys = ref(new Set<string>())

  let timer: ReturnType<typeof setTimeout> | null = null
  watch(query, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { debouncedQuery.value = val }, 150)
  }, { immediate: true })

  function setSelectedKeys(keys: Ref<Set<string>>) {
    watch(keys, (val) => { selectedApiKeys.value = val }, { immediate: true })
  }

  const visibleApis = computed(() => flat.value.filter((item) => {
    if (!matchApi(item, debouncedQuery.value)) return false
    if (showCheckedOnly.value && !selectedApiKeys.value.has(item.key)) return false
    return true
  }))

  return { query, debouncedQuery, showCheckedOnly, visibleApis, setSelectedKeys }
}
