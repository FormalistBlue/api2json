import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 150): Ref<T> {
  const debounced = ref(value.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null
  watch(value, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = val }, delay)
  })
  return debounced
}
