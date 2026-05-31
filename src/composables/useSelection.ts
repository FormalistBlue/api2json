import { computed, ref, type Ref } from 'vue'
import type { FlatApiItem, RawApiNode } from '../types/api'
import { collectKeys, groupSelectionState } from '../utils/apiTree'
import { matchApi } from '../utils/search'

export function useSelection(flat: Ref<FlatApiItem[]>, nodeMap: Ref<Map<RawApiNode, string>>, query: Ref<string>) {
  const selectedApiKeys = ref(new Set<string>())
  const selectedCount = computed(() => selectedApiKeys.value.size)

  function setSelected(key: string, on: boolean) {
    const next = new Set(selectedApiKeys.value)
    if (on) next.add(key)
    else next.delete(key)
    selectedApiKeys.value = next
  }

  function toggleKey(key: string) {
    setSelected(key, !selectedApiKeys.value.has(key))
  }

  function clearSelection() {
    selectedApiKeys.value = new Set()
  }

  function selectVisible(on: boolean) {
    const next = new Set(selectedApiKeys.value)
    for (const item of flat.value) {
      if (!matchApi(item, query.value)) continue
      if (on) next.add(item.key)
      else next.delete(item.key)
    }
    selectedApiKeys.value = next
  }

  function setGroup(node: RawApiNode, on: boolean) {
    const keys: string[] = []
    collectKeys(node, nodeMap.value, keys)
    const next = new Set(selectedApiKeys.value)
    keys.forEach((key) => (on ? next.add(key) : next.delete(key)))
    selectedApiKeys.value = next
  }

  function getGroupState(node: RawApiNode) {
    return groupSelectionState(node, selectedApiKeys.value, nodeMap.value)
  }

  return {
    selectedApiKeys,
    selectedCount,
    setSelected,
    toggleKey,
    clearSelection,
    selectVisible,
    setGroup,
    getGroupState,
  }
}
