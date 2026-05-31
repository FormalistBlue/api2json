<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { NConfigProvider, NMessageProvider, createDiscreteApi } from 'naive-ui'
import { naiveDarkTheme, naiveLightThemeOverrides, naiveDarkThemeOverrides } from './styles/naive-theme'
import { useApiDocument } from './composables/useApiDocument'
import { useApiFilter } from './composables/useApiFilter'
import { useSelection } from './composables/useSelection'
import { useTheme } from './composables/useTheme'
import { useAppEnter } from './composables/useGsapMotion'
import { buildExportRoot } from './utils/apiTree'
import { makeNodeSegment } from './utils/key'
import { copyJson, downloadJson } from './utils/file'
import TopBar from './components/TopBar.vue'
import CommandBar from './components/CommandBar.vue'
import ModuleTree from './components/ModuleTree.vue'
import ApiList from './components/ApiList.vue'
import ApiDetail from './components/ApiDetail.vue'
import JsonPreview from './components/JsonPreview.vue'

const rootRef = ref<HTMLElement | null>(null)
useAppEnter(rootRef)

const doc = useApiDocument()
const { theme, isLight, toggleTheme } = useTheme()
const filter = useApiFilter(doc.flat)
const selection = useSelection(doc.flat, doc.nodeMap, filter.debouncedQuery)
filter.setSelectedKeys(selection.selectedApiKeys)
const collapsedKeys = ref(new Set<string>())

// --- API Detail ---
const detailItem = ref<import('./types/api').FlatApiItem | null>(null)
function showDetail(item: import('./types/api').FlatApiItem) {
  detailItem.value = item
}

// --- JSON Preview ---
const showJsonPreview = ref(false)

// --- Full-screen drag & drop ---
const isGlobalDragging = ref(false)
let dragCounter = 0
function onGlobalDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  if (e.dataTransfer?.types.includes('Files')) isGlobalDragging.value = true
}
function onGlobalDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) { isGlobalDragging.value = false; dragCounter = 0 }
}
function onGlobalDragOver(e: DragEvent) {
  e.preventDefault()
}
async function onGlobalDrop(e: DragEvent) {
  e.preventDefault()
  isGlobalDragging.value = false
  dragCounter = 0
  const file = e.dataTransfer?.files?.[0]
  if (file) await loadFile(file)
}

// --- Panel resize ---
const panelWidth = ref(380)
const isDragging = ref(false)

function onDragStart(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
  if (!isDragging.value) return
  const workspace = rootRef.value?.querySelector('.workspace') as HTMLElement
  if (!workspace) return
  const rect = workspace.getBoundingClientRect()
  const x = e.clientX - rect.left
  panelWidth.value = Math.max(260, Math.min(x, rect.width - 300))
}

function onDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
})

// --- Locate API ---
const apiListRef = ref<InstanceType<typeof ApiList> | null>(null)

function locateApi(key: string) {
  apiListRef.value?.scrollToKey(key)
}

// --- Shared discrete API ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let discreteApi: any = null
function getDiscrete() {
  if (!discreteApi) {
    discreteApi = createDiscreteApi(['message', 'notification'], {
      configProviderProps: computed(() => ({
        theme: isLight.value ? null : naiveDarkTheme,
        themeOverrides: isLight.value ? naiveLightThemeOverrides : naiveDarkThemeOverrides,
      })),
    })
  }
  return discreteApi
}

const modules = computed(() => doc.rawRoot.value?.data || [])
const exportObject = computed(() => doc.rawRoot.value
  ? buildExportRoot(doc.rawRoot.value, selection.selectedApiKeys.value, doc.nodeMap.value)
  : null)

async function loadFile(file: File) {
  await doc.loadFile(file)
  selection.clearSelection()
  collapsedKeys.value = new Set()
  detailItem.value = null

  if (!doc.error.value) {
    const { notification } = getDiscrete()
    notification.success({
      title: '导入成功',
      content: `${doc.fileName.value} — ${doc.moduleCount.value} 个模块，${doc.apiCount.value} 个接口`,
      duration: 3000,
    })
  }
}

function toggleCollapse(key: string) {
  const next = new Set(collapsedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  collapsedKeys.value = next
}

function collapseAll() {
  const keys = new Set<string>()
  function walk(nodes: typeof modules.value, path: string[] = []) {
    nodes.forEach((node, index) => {
      if (node.data?.length) {
        const segment = makeNodeSegment(node, index)
        const key = [...path, segment].join('/')
        keys.add(key)
        walk(node.data, [...path, segment])
      }
    })
  }
  walk(modules.value)
  collapsedKeys.value = keys
}

function expandAll() {
  collapsedKeys.value = new Set()
}

function exportSelected() {
  if (!exportObject.value) return
  const name = doc.fileName.value ? `selected_${doc.fileName.value}` : 'selected_export.json'
  downloadJson(exportObject.value, name)
  const { message } = getDiscrete()
  message.success('导出成功')
}

async function copySelected() {
  if (!exportObject.value) return
  await copyJson(exportObject.value)
  const { message } = getDiscrete()
  message.success('已复制到剪贴板')
}

watch(() => doc.error.value, (err) => {
  if (err) {
    const { notification } = getDiscrete()
    notification.error({
      title: '解析失败',
      content: err,
      duration: 5000,
    })
  }
})
</script>

<template>
  <NConfigProvider :theme="isLight ? null : naiveDarkTheme" :theme-overrides="isLight ? naiveLightThemeOverrides : naiveDarkThemeOverrides">
    <NMessageProvider>
      <div
        ref="rootRef"
        class="app-shell"
        :data-mode="theme"
        :class="{ dragging: isDragging }"
        @dragenter="onGlobalDragEnter"
        @dragleave="onGlobalDragLeave"
        @dragover="onGlobalDragOver"
        @drop="onGlobalDrop"
      >
        <div class="ambient-grid" aria-hidden="true"></div>
        <div class="orb orb-a" aria-hidden="true"></div>
        <div class="orb orb-b" aria-hidden="true"></div>

        <!-- Full-screen drop overlay -->
        <Transition name="fade">
          <div v-if="isGlobalDragging" class="global-drop-overlay">
            <div class="drop-orb"></div>
            <span class="drop-text">释放文件以导入</span>
          </div>
        </Transition>

        <TopBar
          :selected-count="selection.selectedCount.value"
          :api-count="doc.apiCount.value"
          :module-count="doc.moduleCount.value"
          :is-light="isLight"
          :file-name="doc.fileName.value"
          @toggle-theme="toggleTheme"
        />

        <CommandBar
          v-model:query="filter.query.value"
          v-model:show-checked-only="filter.showCheckedOnly.value"
          :has-document="doc.hasDocument.value"
          :selected-count="selection.selectedCount.value"
          :is-parsing="doc.isParsing.value"
          :can-preview="Boolean(exportObject)"
          @file="loadFile"
          @select-visible="selection.selectVisible"
          @export="exportSelected"
          @copy="copySelected"
          @expand-all="expandAll"
          @collapse-all="collapseAll"
          @preview-json="showJsonPreview = true"
        />

        <main class="workspace">
          <ModuleTree
            :nodes="modules"
            :query="filter.debouncedQuery.value"
            :flat="doc.flat.value"
            :node-map="doc.nodeMap.value"
            :selected-keys="selection.selectedApiKeys.value"
            :collapsed-keys="collapsedKeys"
            :get-group-state="selection.getGroupState"
            :style="{ width: panelWidth + 'px', minWidth: panelWidth + 'px' }"
            @toggle-api="selection.toggleKey"
            @set-group="selection.setGroup"
            @toggle-collapse="toggleCollapse"
            @locate-api="locateApi"
          />
          <div class="resize-handle" @mousedown="onDragStart"></div>
          <ApiList
            ref="apiListRef"
            :items="filter.visibleApis.value"
            :total="doc.flat.value.length"
            :query="filter.debouncedQuery.value"
            :selected-keys="selection.selectedApiKeys.value"
            :has-document="doc.hasDocument.value"
            @toggle="selection.toggleKey"
            @clear-query="filter.query.value = ''"
            @show-detail="showDetail"
          />
        </main>

        <!-- API Detail Drawer -->
        <ApiDetail
          :item="detailItem"
          @close="detailItem = null"
        />

        <!-- JSON Preview Modal -->
        <JsonPreview
          v-if="showJsonPreview && exportObject"
          :data="exportObject"
          @close="showJsonPreview = false"
        />
      </div>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>
.app-shell {
  position: relative;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-shell.dragging { cursor: col-resize; user-select: none; }
.ambient-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at 50% 20%, black, transparent 72%);
  opacity: .25;
}
.orb {
  position: fixed;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(48px);
  opacity: .22;
  background: var(--accent);
}
.orb-a { left: -90px; top: 22%; }
.orb-b { right: -130px; bottom: -80px; opacity: .13; }
.workspace {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 18px 18px 26px 30px;
}
.resize-handle {
  width: 6px;
  margin: 0 5px;
  cursor: col-resize;
  border-radius: 3px;
  background: transparent;
  transition: background .15s;
  flex-shrink: 0;
}
.resize-handle:hover,
.dragging .resize-handle {
  background: var(--accent);
}
@media (max-width: 860px) {
  .app-shell { overflow: auto; }
  .workspace { flex-direction: column; padding: 14px 16px 22px; }
  .resize-handle { display: none; }
}

/* Global drop overlay */
.global-drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: rgba(15, 118, 110, 0.12);
  backdrop-filter: blur(8px);
  pointer-events: none;
}
.drop-orb {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--accent);
  filter: blur(80px);
  opacity: .3;
  animation: pulse-orb 1.6s ease-in-out infinite alternate;
}
.drop-text {
  position: relative;
  font-size: 22px;
  font-weight: 600;
  color: var(--accent-strong);
  letter-spacing: -0.02em;
}
@keyframes pulse-orb {
  from { transform: scale(1); opacity: .25; }
  to { transform: scale(1.15); opacity: .4; }
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
