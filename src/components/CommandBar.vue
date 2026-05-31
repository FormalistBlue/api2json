<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon, NInput, NSwitch, useMessage } from 'naive-ui'
import { Copy, Download, Search, View } from '@vicons/carbon'
import UploadZone from './UploadZone.vue'
import { flashExport } from '../composables/useGsapMotion'

const props = defineProps<{
  query: string
  showCheckedOnly: boolean
  hasDocument: boolean
  selectedCount: number
  isParsing: boolean
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'update:showCheckedOnly': [value: boolean]
  file: [file: File]
  selectVisible: [on: boolean]
  export: []
  copy: []
  expandAll: []
  collapseAll: []
}>()

const exportRef = ref<HTMLElement | null>(null)
const message = useMessage()
const canExport = computed(() => props.hasDocument && props.selectedCount > 0)

function onExport() {
  if (!canExport.value) {
    message.warning('请先选择至少一个接口')
    return
  }
  flashExport(exportRef.value)
  emit('export')
}
</script>

<template>
  <section class="command-bar" data-enter="command">
    <UploadZone @file="emit('file', $event)" />
    <NInput
      class="search-input"
      :value="query"
      round
      clearable
      placeholder="搜索模块、URL、标题或 Method"
      @update:value="emit('update:query', $event)"
    >
      <template #prefix><NIcon :component="Search" /></template>
    </NInput>

    <div class="btn-group">
      <NButton quaternary :disabled="!hasDocument" @click="emit('selectVisible', true)">全选当前</NButton>
      <NButton quaternary :disabled="!hasDocument" @click="emit('selectVisible', false)">取消当前</NButton>
      <NButton quaternary :disabled="!hasDocument" @click="emit('expandAll')">展开</NButton>
      <NButton quaternary :disabled="!hasDocument" @click="emit('collapseAll')">折叠</NButton>
    </div>
    <label class="checked-switch">
      <NIcon :component="View" />
      <span>只看已选</span>
      <NSwitch :value="showCheckedOnly" @update:value="emit('update:showCheckedOnly', $event)" />
    </label>
    <NButton secondary :disabled="!canExport" @click="emit('copy')">
      <template #icon><NIcon :component="Copy" /></template>
      复制已选
    </NButton>
    <NButton ref="exportRef" class="export-btn" type="primary" :disabled="!canExport" @click="onExport">
      <template #icon><NIcon :component="Download" /></template>
      导出已选
    </NButton>
  </section>
</template>

<style scoped>
.command-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(250, 252, 249, 0.74);
  box-shadow: 0 10px 28px rgba(42, 73, 60, 0.06);
  backdrop-filter: blur(20px);
}
[data-theme='dark'] .command-bar {
  background: rgba(10, 16, 14, 0.44);
}
.search-input { width: min(34vw, 420px); }
.btn-group {
  display: inline-flex;
  border: 1px solid rgba(69, 93, 82, 0.18);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
}
.btn-group :deep(.n-button) {
  border-radius: 0;
  border: none;
  border-right: 1px solid rgba(69, 93, 82, 0.12);
  font-size: 12px;
  font-weight: 500;
  padding: 0 12px;
}
.btn-group :deep(.n-button:last-child) {
  border-right: none;
}
.btn-group :deep(.n-button:not(:disabled):hover) {
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
}
[data-theme='dark'] .btn-group {
  border-color: rgba(111, 136, 124, 0.22);
  background: rgba(255, 255, 255, 0.04);
}
[data-theme='dark'] .btn-group :deep(.n-button) {
  border-right-color: rgba(111, 136, 124, 0.14);
}
[data-theme='dark'] .btn-group :deep(.n-button:not(:disabled):hover) {
  background: rgba(20, 184, 166, 0.12);
  color: #2dd4bf;
}
.checked-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  padding: 0 8px;
  white-space: nowrap;
}
.export-btn { position: relative; overflow: hidden; margin-left: auto; --shine-x: -120%; }
.export-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.36), transparent);
  transform: translateX(var(--shine-x));
  pointer-events: none;
}
@media (max-width: 1120px) {
  .command-bar { flex-wrap: wrap; padding: 12px 16px; }
  .search-input { flex: 1 1 260px; width: auto; }
  .export-btn { margin-left: 0; }
}
</style>
