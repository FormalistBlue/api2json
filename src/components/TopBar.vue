<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NIcon, NSwitch } from 'naive-ui'
import { Moon, Sun } from '@vicons/carbon'
import { animateNumber } from '../composables/useGsapMotion'

const props = defineProps<{
  selectedCount: number
  apiCount: number
  moduleCount: number
  isLight: boolean
  fileName: string
}>()

defineEmits<{ toggleTheme: [] }>()

const selectedRef = ref<HTMLElement | null>(null)
const totalRef = ref<HTMLElement | null>(null)
const completion = computed(() => props.apiCount ? Math.round((props.selectedCount / props.apiCount) * 100) : 0)

watch(() => props.selectedCount, (value) => animateNumber(selectedRef.value, value), { immediate: true })
watch(() => props.apiCount, (value) => animateNumber(totalRef.value, value), { immediate: true })
</script>

<template>
  <header class="topbar" data-enter="top">
    <div class="brand-block">
      <div class="eyebrow">API2JSON WORKBENCH</div>
      <h1>API 拆分器</h1>
      <p class="hint">上传、过滤并提取模块化的 JSON 定义。</p>
    </div>

    <span v-if="fileName" class="file-name" :title="fileName">{{ fileName }}</span>

    <div class="status-rail" data-enter="rail">
      <div class="metric accent">
        <span class="label">已选择</span>
        <strong><span ref="selectedRef">{{ selectedCount }}</span><small>/</small><span ref="totalRef">{{ apiCount }}</span><small class="pct">（{{ completion }}%）</small></strong>
      </div>
      <div class="metric">
        <span class="label">模块</span>
        <strong>{{ moduleCount }}</strong>
      </div>
      <div class="theme-toggle">
        <NIcon :component="isLight ? Sun : Moon" size="18" />
        <NSwitch :value="isLight" @update:value="$emit('toggleTheme')" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 30px;
  border-bottom: 1px solid var(--border-subtle);
  background:
    radial-gradient(circle at 14% 0%, rgba(15, 118, 110, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 247, 0.78));
  box-shadow: 0 14px 40px rgba(42, 73, 60, 0.08);
  backdrop-filter: blur(20px);
}
[data-theme='dark'] .topbar {
  background: linear-gradient(180deg, rgba(13, 19, 17, 0.86), rgba(13, 19, 17, 0.5));
}
.brand-block { min-width: 0; }
.eyebrow {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  margin-bottom: 2px;
}
h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 650;
}
.hint { color: var(--text-muted); font-size: 13px; margin: 3px 0 0; }
.file-name {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(400px, 28vw);
}
.pct { color: rgba(239,255,251,0.72); font-size: 12px; margin-left: 2px; }
.status-rail { display: flex; align-items: stretch; gap: 10px; }
.metric, .theme-toggle {
  min-width: 104px;
  padding: 10px 12px;
  border: 1px solid rgba(69, 93, 82, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow:
    0 10px 30px rgba(42, 73, 60, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.74);
}
.metric .label { display: block; color: var(--text-muted); font-size: 11px; margin-bottom: 3px; }
.metric strong { font-family: var(--font-mono); font-size: 18px; letter-spacing: -0.04em; }
.metric small { color: var(--text-muted); font-size: 12px; margin: 0 3px; }
.metric.accent { background: linear-gradient(135deg, #0f766e, #0d9488); color: #f2fffb; border-color: transparent; box-shadow: 0 12px 34px rgba(15, 118, 110, 0.2); }
.metric.accent .label, .metric.accent small { color: rgba(239,255,251,0.72); }
.theme-toggle { min-width: 88px; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-muted); }
[data-theme='dark'] .metric,
[data-theme='dark'] .theme-toggle {
  min-width: 104px;
  background: var(--bg-panel);
  border-color: var(--border-subtle);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
[data-theme='dark'] .metric.accent {
  background: linear-gradient(135deg, var(--accent), #0f766e);
  box-shadow: none;
}
@media (max-width: 900px) {
  .topbar { align-items: stretch; flex-direction: column; padding: 20px 16px 14px; }
  .status-rail { overflow-x: auto; }
  p { max-width: 100%; white-space: normal; }
}
</style>
