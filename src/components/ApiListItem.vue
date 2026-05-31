<script setup lang="ts">
import { ref } from 'vue'
import { NCheckbox, NIcon } from 'naive-ui'
import { Copy, Information } from '@vicons/carbon'
import type { FlatApiItem } from '../types/api'
import MethodBadge from './MethodBadge.vue'

const props = defineProps<{ item: FlatApiItem; checked: boolean; query: string }>()
const emit = defineEmits<{
  toggle: [key: string]
  showDetail: [item: FlatApiItem]
}>()

const copied = ref(false)

function copyUrl(e: Event) {
  e.stopPropagation()
  const url = props.item.api?.url
  if (!url) return
  navigator.clipboard.writeText(String(url))
  copied.value = true
  setTimeout(() => { copied.value = false }, 1200)
}

function openDetail(e: Event) {
  e.stopPropagation()
  emit('showDetail', props.item)
}

/** Highlight matching portions of text */
function highlightText(text: string, query: string): string {
  if (!query || !text) return escapeHtml(text)
  const q = query.trim().toLowerCase()
  const idx = text.toLowerCase().indexOf(q)
  if (idx < 0) return escapeHtml(text)
  const before = escapeHtml(text.slice(0, idx))
  const match = escapeHtml(text.slice(idx, idx + q.length))
  const after = escapeHtml(text.slice(idx + q.length))
  return `${before}<mark class="hl">${match}</mark>${after}`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
</script>

<template>
  <article class="api-item" data-list-item @click="$emit('toggle', item.key)">
    <NCheckbox :checked="checked" @click.stop @update:checked="$emit('toggle', item.key)" />
    <div class="api-main">
      <div class="api-title">
        <MethodBadge :method="String(item.api.method || 'ANY')" />
        <strong v-html="highlightText(String(item.api.name || item.api.title || '未命名接口'), query)"></strong>
      </div>
      <code class="api-url" v-html="highlightText(String(item.api.url || '无 URL 字段'), query)"></code>
      <div class="breadcrumb" :title="item.pathNames.filter(Boolean).join(' / ')">
        {{ item.pathNames.filter(Boolean).join(' / ') || '根级接口' }}
      </div>
    </div>

    <!-- Fixed action bar, right-aligned, visible on hover -->
    <div class="actions" @click.stop>
      <button class="action-icon" :class="{ done: copied }" title="复制 URL" @click="copyUrl">
        <NIcon :component="Copy" size="14" />
      </button>
      <button class="action-icon" title="查看详情" @click="openDetail">
        <NIcon :component="Information" size="15" />
      </button>
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
  padding-right: 72px;
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

/* Fixed action bar — always in the same spot */
.actions {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity .15s ease;
}
.api-item:hover .actions { opacity: 1; }

.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-panel-solid);
  color: var(--text-muted);
  cursor: pointer;
  transition: all .15s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.action-icon:hover {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 3px 10px var(--accent-shadow);
  transform: scale(1.08);
}
.action-icon.done {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
}

/* Dark mode: solid bg, brighter icons */
[data-theme='dark'] .action-icon {
  background: rgba(30, 42, 37, 0.92);
  border-color: rgba(137, 164, 151, 0.35);
  color: #94a99d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
[data-theme='dark'] .action-icon:hover {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 3px 12px rgba(20, 184, 166, 0.3);
}

/* Search highlight */
:deep(.hl) {
  background: rgba(20, 184, 166, 0.2);
  color: var(--accent-strong);
  border-radius: 3px;
  padding: 0 1px;
}
[data-theme='dark'] :deep(.hl) {
  background: rgba(20, 184, 166, 0.25);
  color: #2dd4bf;
}
</style>
