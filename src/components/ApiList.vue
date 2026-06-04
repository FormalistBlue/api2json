<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { FlatApiItem } from '../types/api'
import { animateList } from '../composables/useGsapMotion'
import { gsap } from 'gsap'
import ApiListItem from './ApiListItem.vue'
import EmptyPanel from './EmptyPanel.vue'

const props = defineProps<{
  items: FlatApiItem[]
  total: number
  query: string
  selectedKeys: Set<string>
  hasDocument: boolean
}>()

const emit = defineEmits<{
  toggle: [key: string]
  clearQuery: []
  showDetail: [item: FlatApiItem]
}>()

const listRef = ref<HTMLElement | null>(null)
const useVirtual = computed(() => props.items.length > 200)

const virtualizer = useVirtualizer({
  get count() { return props.items.length },
  getScrollElement: () => listRef.value,
  estimateSize: () => 118,
  overscan: 8,
})

function highlightEl(el: Element) {
  gsap.fromTo(el as HTMLElement,
    { boxShadow: 'inset 0 0 0 2px rgba(15,118,110,0.6)', background: 'rgba(15,118,110,0.08)' },
    { boxShadow: 'inset 0 0 0 2px transparent', background: 'transparent', duration: 1.2, ease: 'power2.out' },
  )
}

function scrollToKey(key: string) {
  if (useVirtual.value) {
    const index = props.items.findIndex(item => item.key === key)
    if (index >= 0) {
      virtualizer.value.scrollToIndex(index, { align: 'center' })
      nextTick(() => {
        const el = document.querySelector(`[data-key="${key}"]`)
        if (el) highlightEl(el)
      })
    }
  } else if (listRef.value) {
    const el = listRef.value.querySelector(`[data-key="${key}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => highlightEl(el), 350)
    }
  }
}

defineExpose({ scrollToKey })

watch(() => [props.items.length, props.query], async () => {
  if (useVirtual.value) return
  await nextTick()
  animateList(listRef.value)
})
</script>

<template>
  <section class="panel api-panel" data-enter="panel">
    <div class="panel-head">
      <div>
        <span class="kicker">ENDPOINT LEDGER</span>
        <h2>接口</h2>
      </div>
      <span class="pill">{{ items.length }} / {{ total }}</span>
    </div>

    <EmptyPanel
      v-if="!hasDocument"
      title="选择一个 JSON 文件以查看接口"
      description="解析完成后，右侧会按模块路径展示所有接口，支持搜索、勾选和导出。"
    />
    <EmptyPanel
      v-else-if="!items.length"
      title="没有匹配结果"
      :description="query ? `当前关键词：${query}` : '当前筛选条件下没有接口。'"
      action="清空搜索"
      @action="$emit('clearQuery')"
    />

    <!-- Virtual list for large datasets -->
    <div
      v-else-if="useVirtual"
      ref="listRef"
      class="api-wrap api-scroller"
    >
      <div :style="{ height: virtualizer.getTotalSize() + 'px', position: 'relative', width: '100%' }">
        <div
          v-for="row in virtualizer.getVirtualItems()"
          :key="String(row.key)"
          :style="{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }"
        >
          <ApiListItem
            :data-key="items[row.index].key"
            :item="items[row.index]"
            :checked="selectedKeys.has(items[row.index].key)"
            :query="query"
            @toggle="$emit('toggle', $event)"
            @show-detail="$emit('showDetail', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Normal list for smaller datasets -->
    <div v-else ref="listRef" class="api-wrap">
      <ApiListItem
        v-for="item in items"
        :key="item.key"
        :data-key="item.key"
        :item="item"
        :checked="selectedKeys.has(item.key)"
        :query="query"
        @toggle="$emit('toggle', $event)"
        @show-detail="$emit('showDetail', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.panel { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--border-subtle); border-radius: 24px; background: var(--bg-panel); box-shadow: var(--shadow-panel), inset 0 1px 0 rgba(255,255,255,0.06); overflow: hidden; }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid var(--border-subtle); }
.kicker { font-family: var(--font-mono); color: var(--accent); font-size: 10px; letter-spacing: .18em; }
h2 { margin: 3px 0 0; font-size: 18px; letter-spacing: -0.03em; }
.pill { font-family: var(--font-mono); color: var(--text-muted); border: 1px solid var(--border-subtle); border-radius: 999px; padding: 3px 9px; }
.api-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0 6px 8px 0;
  padding: 12px 6px 18px 12px;
  scrollbar-gutter: stable;
}
.api-scroller { padding: 12px 6px 18px 12px; }
</style>
