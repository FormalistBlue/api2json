import { computed, ref, watch, type Ref } from 'vue'
import type { FlatApiItem } from '../types/api'
import { matchApi } from '../utils/search'
import { useDebounce } from './useDebounce'

export function useApiFilter(flat: Ref<FlatApiItem[]>) {
  const query = ref('')
  const showCheckedOnly = ref(false)
  const selectedApiKeys = ref(new Set<string>())

  const debouncedQuery = useDebounce(query, 150)

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
