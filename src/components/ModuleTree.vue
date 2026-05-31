<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { FlatApiItem, RawApiNode } from '../types/api'
import { makeNodeSegment } from '../utils/key'
import { animateList } from '../composables/useGsapMotion'
import EmptyPanel from './EmptyPanel.vue'
import ModuleTreeNode from './ModuleTreeNode.vue'

const props = defineProps<{
  nodes: RawApiNode[]
  query: string
  flat: FlatApiItem[]
  selectedKeys: Set<string>
  collapsedKeys: Set<string>
  getGroupState: (node: RawApiNode) => { checked: boolean; indeterminate: boolean; selected: number; total: number }
}>()

const emit = defineEmits<{
  toggleApi: [key: string]
  setGroup: [node: RawApiNode, on: boolean]
  toggleCollapse: [key: string]
  locateApi: [key: string]
}>()

const listRef = ref<HTMLElement | null>(null)
watch(() => [props.nodes, props.query], async () => {
  await nextTick()
  animateList(listRef.value)
}, { deep: false })
</script>

<template>
  <section class="panel module-panel" data-enter="panel">
    <div class="panel-head">
      <div>
        <span class="kicker">MODULE MAP</span>
        <h2>模块</h2>
      </div>
      <span class="pill">{{ nodes.length }}</span>
    </div>
    <div ref="listRef" class="tree-wrap">
      <EmptyPanel v-if="!nodes.length" title="等待导入 API JSON" description="拖入或选择一个 JSON 文件后，这里会显示可选择的模块树。" />
      <ModuleTreeNode
        v-for="(node, index) in nodes"
        v-else
        :key="makeNodeSegment(node, index)"
        :node="node"
        :index="index"
        :id-path="[]"
        :query="query"
        :flat="flat"
        :selected-keys="selectedKeys"
        :collapsed-keys="collapsedKeys"
        :get-group-state="getGroupState"
        @toggle-api="emit('toggleApi', $event)"
        @set-group="(node, on) => emit('setGroup', node, on)"
        @toggle-collapse="emit('toggleCollapse', $event)"
        @locate-api="emit('locateApi', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.panel { min-width: 260px; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--border-subtle); border-radius: 24px; background: var(--bg-panel); box-shadow: var(--shadow-panel), inset 0 1px 0 rgba(255,255,255,0.06); overflow: hidden; }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid var(--border-subtle); }
.kicker { font-family: var(--font-mono); color: var(--accent); font-size: 10px; letter-spacing: .18em; }
h2 { margin: 3px 0 0; font-size: 18px; letter-spacing: -0.03em; }
.pill { font-family: var(--font-mono); color: var(--text-muted); border: 1px solid var(--border-subtle); border-radius: 999px; padding: 3px 9px; }
.tree-wrap { flex: 1; min-height: 0; overflow: auto; padding: 12px; }
</style>
