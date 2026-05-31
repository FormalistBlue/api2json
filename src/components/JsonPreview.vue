<script setup lang="ts">
import { computed, ref } from 'vue'
import { NIcon } from 'naive-ui'
import { Close, Copy, Download } from '@vicons/carbon'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const props = defineProps<{ data: unknown }>()
const emit = defineEmits<{ close: [] }>()

const json = computed(() => JSON.stringify(props.data, null, 2))
const lineCount = computed(() => json.value.split('\n').length)
const byteSize = computed(() => {
  const bytes = new Blob([json.value]).size
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
})

const deepLevel = ref(3)

const copied = ref(false)
function copyAll() {
  navigator.clipboard.writeText(json.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function download() {
  const blob = new Blob([json.value], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'selected_export.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="preview-backdrop" @click.self="emit('close')">
    <div class="preview-modal">
      <header class="preview-header">
        <div>
          <h3>JSON 预览</h3>
          <span class="meta">{{ lineCount }} 行 · {{ byteSize }}</span>
        </div>
        <div class="preview-actions">
          <label class="depth-control">
            <span>展开层级</span>
            <input v-model.number="deepLevel" type="range" min="1" max="10" />
            <span class="depth-val">{{ deepLevel }}</span>
          </label>
          <button class="action-btn" :class="{ done: copied }" @click="copyAll">
            <NIcon :component="Copy" size="14" />
            {{ copied ? '已复制' : '复制' }}
          </button>
          <button class="action-btn primary" @click="download">
            <NIcon :component="Download" size="14" />
            下载
          </button>
          <button class="close-btn" @click="emit('close')">
            <NIcon :component="Close" size="18" />
          </button>
        </div>
      </header>
      <div class="json-tree-wrap">
        <VueJsonPretty
          :data="(props.data as any)"
          :deep="deepLevel"
          show-length
          show-line
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  animation: fade-in .2s ease;
}
.preview-modal {
  width: min(860px, 92vw);
  height: min(72vh, 680px);
  display: flex;
  flex-direction: column;
  background: var(--bg-panel-solid);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: scale-in .25s cubic-bezier(.16,1,.3,1);
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 10px;
}
.preview-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.meta { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
.preview-actions { display: flex; align-items: center; gap: 8px; }

.depth-control {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.depth-control input[type="range"] {
  width: 80px;
  accent-color: var(--accent);
}
.depth-val {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent);
  min-width: 16px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: transparent;
  color: var(--text-main);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s ease;
}
.action-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.action-btn.done { color: var(--accent-strong); border-color: var(--accent); }
.action-btn.primary { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
.action-btn.primary:hover { background: var(--accent); color: #fff; }
.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all .15s ease;
}
.close-btn:hover { background: var(--bg-hover); color: var(--text-main); }

.json-tree-wrap {
  flex: 1;
  overflow: auto;
  padding: 16px 20px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  background: var(--bg-soft);
}

/* vue-json-pretty theme overrides (global, not scoped) */
</style>

<style>
.vjs-key { color: #0f766e; }
.vjs-value-string { color: #16a34a; }
.vjs-value-number, .vjs-value-boolean { color: #d97706; }
.vjs-value-null, .vjs-value-undefined { color: var(--text-dim); }
.vjs-tree-node:hover { background: var(--accent-soft); }

[data-theme='dark'] .vjs-key { color: #e2e8f0 !important; }
[data-theme='dark'] .vjs-value-string { color: #4ade80; }
[data-theme='dark'] .vjs-value-number,
[data-theme='dark'] .vjs-value-boolean { color: #fbbf24; }
[data-theme='dark'] .vjs-tree-node:hover { background: rgba(20, 184, 166, 0.08); }
[data-theme='dark'] .vjs-tree-node.is-highlight { background: rgba(20, 184, 166, 0.08); }
[data-theme='dark'] .vjs-tree-node .vjs-tree-node-actions { background: rgba(20, 184, 166, 0.08); }

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
