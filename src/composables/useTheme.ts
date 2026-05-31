import { computed, ref, watchEffect } from 'vue'

type ThemeMode = 'dark' | 'light'

const theme = ref<ThemeMode>((localStorage.getItem('api-splitter-theme') as ThemeMode) || 'light')

export function useTheme() {
  watchEffect(() => {
    document.documentElement.dataset.theme = theme.value
    localStorage.setItem('api-splitter-theme', theme.value)
  })

  const isLight = computed(() => theme.value === 'light')
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, isLight, toggleTheme }
}
