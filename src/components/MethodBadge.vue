<script setup lang="ts">
const props = defineProps<{ method?: string }>()
const methodText = (props.method || 'ANY').toUpperCase()
const methodClass = `method-${methodText.toLowerCase()}`
</script>

<template>
  <span class="method-badge" :class="methodClass">{{ methodText }}</span>
</template>

<style scoped>
.method-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 20px;
  padding: 0 7px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border: 1px solid currentColor;
  background: color-mix(in srgb, currentColor 14%, transparent);
}
.method-get { color: var(--method-get); }
.method-post { color: var(--method-post); }
.method-put { color: var(--method-put); }
.method-delete { color: var(--method-delete); }
.method-patch { color: var(--method-patch); }
.method-any, .method- { color: var(--text-muted); }
</style>
