<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { Close, Copy } from '@vicons/carbon'
import type { FlatApiItem } from '../types/api'
import MethodBadge from './MethodBadge.vue'

const props = defineProps<{ item: FlatApiItem | null }>()
const emit = defineEmits<{ close: [] }>()

const api = computed(() => props.item?.api)
const params = computed(() => {
  if (!api.value) return []
  const raw = api.value.param
  if (!Array.isArray(raw)) return []
  return raw
})

function copyField(text: string) {
  navigator.clipboard.writeText(text)
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}
</script>

<template>
  <Transition name="drawer">
    <div v-if="item && api" class="detail-backdrop" @click.self="emit('close')">
      <aside class="detail-drawer">
        <header class="detail-header">
          <div class="detail-title-row">
            <MethodBadge :method="String(api.method || 'ANY')" />
            <h3>{{ api.name || api.title || '未命名接口' }}</h3>
          </div>
          <button class="close-btn" @click="emit('close')">
            <NIcon :component="Close" size="20" />
          </button>
        </header>

        <div class="detail-body">
          <!-- URL -->
          <section class="detail-section">
            <label class="section-label">URL</label>
            <div class="mono-block url-block">
              <code>{{ api.url || '—' }}</code>
              <button v-if="api.url" class="copy-btn" @click="copyField(String(api.url))">
                <NIcon :component="Copy" size="13" />
              </button>
            </div>
          </section>

          <!-- Method -->
          <section class="detail-section">
            <label class="section-label">Method</label>
            <span class="mono-block">{{ String(api.method || 'ANY').toUpperCase() }}</span>
          </section>

          <!-- Path -->
          <section v-if="item.pathNames.filter(Boolean).length" class="detail-section">
            <label class="section-label">模块路径</label>
            <div class="path-breadcrumb">
              <span v-for="(seg, i) in item.pathNames.filter(Boolean)" :key="i" class="path-seg">
                {{ seg }}
              </span>
            </div>
          </section>

          <!-- Params -->
          <section v-if="params.length" class="detail-section">
            <label class="section-label">参数 ({{ params.length }})</label>
            <div class="params-table-wrap">
              <table class="params-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>必填</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in params" :key="i">
                    <td class="param-name">{{ (p as any).name || (p as any).key || '—' }}</td>
                    <td class="param-type">{{ (p as any).type || '—' }}</td>
                    <td>{{ (p as any).required ? '✓' : '' }}</td>
                    <td class="param-remark">{{ (p as any).remark || (p as any).description || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Raw JSON -->
          <section class="detail-section">
            <label class="section-label">原始数据</label>
            <pre class="raw-json">{{ formatValue(api) }}</pre>
          </section>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
}
.detail-drawer {
  width: min(520px, 88vw);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel-solid);
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.detail-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.detail-title-row h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all .15s ease;
}
.close-btn:hover { background: var(--bg-hover); color: var(--text-main); }

.detail-body {
  flex: 1;
  overflow: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detail-section { display: flex; flex-direction: column; gap: 6px; }
.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: .1em;
  font-family: var(--font-mono);
}
.mono-block {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-main);
  background: var(--bg-soft);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 8px 12px;
  word-break: break-all;
}
.url-block {
  display: flex;
  align-items: center;
  gap: 8px;
}
.url-block code { flex: 1; min-width: 0; word-break: break-all; }
.copy-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all .15s ease;
}
.copy-btn:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }

.path-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.path-seg {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-soft);
  color: var(--text-muted);
}
.path-seg::after { content: '›'; margin-left: 6px; color: var(--text-dim); }
.path-seg:last-child::after { content: ''; }

.params-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}
.params-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.params-table th {
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: 8px 12px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border-subtle);
}
.params-table td {
  padding: 7px 12px;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
}
.params-table tr:last-child td { border-bottom: none; }
.param-name { font-family: var(--font-mono); font-weight: 600; color: var(--accent); white-space: nowrap; }
.param-type { font-family: var(--font-mono); color: var(--text-muted); white-space: nowrap; }
.param-remark { color: var(--text-muted); max-width: 200px; }

.raw-json {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-soft);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
  max-height: 300px;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Drawer transition */
.drawer-enter-active, .drawer-leave-active { transition: all .25s cubic-bezier(.16,1,.3,1); }
.drawer-enter-active .detail-drawer, .drawer-leave-active .detail-drawer { transition: transform .25s cubic-bezier(.16,1,.3,1); }
.drawer-enter-from { opacity: 0; }
.drawer-enter-from .detail-drawer { transform: translateX(100%); }
.drawer-leave-to { opacity: 0; }
.drawer-leave-to .detail-drawer { transform: translateX(100%); }
</style>
