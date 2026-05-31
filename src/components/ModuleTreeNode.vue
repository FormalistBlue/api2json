<script setup lang="ts">
import { computed } from 'vue'
import { NCheckbox, NIcon } from 'naive-ui'
import { ArrowRight, ChevronDown } from '@vicons/carbon'
import type { FlatApiItem, RawApiNode } from '../types/api'
import { countApis, isApiNode } from '../utils/apiTree'
import { makeNodeSegment } from '../utils/key'
import { matchGroup } from '../utils/search'
import MethodBadge from './MethodBadge.vue'

const props = defineProps<{
  node: RawApiNode
  index: number
  idPath: string[]
  query: string
  flat: FlatApiItem[]
  nodeMap: Map<RawApiNode, string>
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

const nodeKey = computed(() => [...props.idPath, makeNodeSegment(props.node, props.index)].join('/'))
const apiKey = computed(() => isApiNode(props.node) ? (props.nodeMap.get(props.node) || '') : '')
const isCollapsed = computed(() => props.collapsedKeys.has(nodeKey.value))
const apiCount = computed(() => countApis(props.node))
const groupState = computed(() => props.getGroupState(props.node))
const visible = computed(() => {
  if (isApiNode(props.node)) {
    const hay = `${props.node.name || ''} ${props.node.title || ''} ${props.node.url || ''} ${props.node.method || ''}`.toLowerCase()
    return !props.query || hay.includes(props.query.trim().toLowerCase())
  }
  return apiCount.value > 0 && matchGroup(props.node, props.query)
})
</script>

<template>
  <template v-if="visible">
    <div v-if="isApiNode(node)" class="tree-api" data-list-item @click="emit('toggleApi', apiKey)">
      <NCheckbox :checked="selectedKeys.has(apiKey)" @click.stop @update:checked="emit('toggleApi', apiKey)" />
      <MethodBadge :method="String(node.method || 'ANY')" />
      <span class="api-name" :title="String(node.url || '')">{{ node.name || node.title || '未命名接口' }}</span>
      <NIcon class="locate-icon" :component="ArrowRight" @click.stop="emit('locateApi', apiKey)" />
    </div>

    <div v-else class="tree-group" :class="{ collapsed: isCollapsed }" data-list-item>
      <div class="group-head" @click="emit('toggleCollapse', nodeKey)">
        <NCheckbox
          :checked="groupState.checked"
          :indeterminate="groupState.indeterminate"
          @click.stop
          @update:checked="emit('setGroup', node, $event)"
        />
        <NIcon class="chevron" :component="ChevronDown" />
        <span class="group-name">{{ node.name || '未命名模块' }}</span>
        <span class="count">{{ apiCount }}</span>
      </div>
      <div v-show="!isCollapsed" class="children">
        <ModuleTreeNode
          v-for="(child, childIndex) in node.data || []"
          :key="[nodeKey, makeNodeSegment(child, childIndex)].join('/')"
          :node="child"
          :index="childIndex"
          :id-path="[...idPath, makeNodeSegment(node, index)]"
          :query="query"
          :flat="flat"
          :node-map="nodeMap"
          :selected-keys="selectedKeys"
          :collapsed-keys="collapsedKeys"
          :get-group-state="getGroupState"
          @toggle-api="emit('toggleApi', $event)"
          @set-group="(childNode, on) => emit('setGroup', childNode, on)"
          @toggle-collapse="emit('toggleCollapse', $event)"
          @locate-api="emit('locateApi', $event)"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
.tree-api, .group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}
.tree-api:hover, .group-head:hover { background: var(--bg-hover); border-color: var(--border-subtle); transform: translateX(2px); }
.group-head { margin-top: 2px; }
.chevron { color: var(--text-muted); transition: transform .2s ease; }
.collapsed > .group-head .chevron { transform: rotate(-90deg); }
.group-name, .api-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-name { font-weight: 600; }
.api-name { font-size: 13px; }
.locate-icon {
  color: var(--text-dim);
  cursor: pointer;
  opacity: 0;
  transition: opacity .15s, color .15s;
  flex-shrink: 0;
}
.locate-icon:hover { color: var(--accent-strong); }
.tree-api:hover .locate-icon { opacity: 1; }
.count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-soft);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  padding: 1px 7px;
}
.children {
  margin-left: 18px;
  padding-left: 10px;
  border-left: 1px solid var(--border-subtle);
}
</style>
