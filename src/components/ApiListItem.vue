<script setup lang="ts">
import { NCheckbox } from 'naive-ui'
import type { FlatApiItem } from '../types/api'
import MethodBadge from './MethodBadge.vue'

defineProps<{ item: FlatApiItem; checked: boolean }>()
defineEmits<{ toggle: [key: string] }>()
</script>

<template>
  <article class="api-item" data-list-item @click="$emit('toggle', item.key)">
    <NCheckbox :checked="checked" @click.stop @update:checked="$emit('toggle', item.key)" />
    <div class="api-main">
      <div class="api-title">
        <MethodBadge :method="String(item.api.method || 'ANY')" />
        <strong>{{ item.api.name || item.api.title || '未命名接口' }}</strong>
      </div>
      <code class="api-url">{{ item.api.url || '无 URL 字段' }}</code>
      <div class="breadcrumb" :title="item.pathNames.filter(Boolean).join(' / ')">
        {{ item.pathNames.filter(Boolean).join(' / ') || '根级接口' }}
      </div>
    </div>
  </article>
</template>

<style scoped>
.api-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px;
  border: 1px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: background .2s ease, border-color .2s ease, transform .2s ease;
}
.api-item::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle at 0% 50%, var(--accent-soft), transparent 48%);
  transition: opacity .2s ease;
}
.api-item:hover { background: var(--bg-hover); border-color: var(--border-subtle); transform: translateX(3px); z-index: 1; }
.api-item:hover::before { opacity: 1; }
.api-main { position: relative; flex: 1; min-width: 0; }
.api-title { display: flex; align-items: center; gap: 9px; min-width: 0; }
.api-title strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 600; }
.api-url { display: block; margin-top: 6px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.breadcrumb { display: inline-block; max-width: 100%; margin-top: 8px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border-subtle); color: var(--text-muted); background: var(--bg-soft); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
