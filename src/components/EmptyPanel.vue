<script setup lang="ts">
defineProps<{ title: string; description?: string; action?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty-panel">
    <div class="empty-orbit" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <button v-if="action" class="ghost-action" type="button" @click="$emit('action')">{{ action }}</button>
  </div>
</template>

<style scoped>
.empty-panel {
  min-height: 260px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 32px;
  color: var(--text-muted);
  text-align: center;
}
.empty-orbit {
  position: relative;
  width: 72px;
  height: 72px;
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-soft), transparent 62%);
}
.empty-orbit span {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 20px var(--accent-shadow);
}
.empty-orbit span:nth-child(1) { left: 10px; top: 18px; }
.empty-orbit span:nth-child(2) { right: 12px; top: 28px; }
.empty-orbit span:nth-child(3) { left: 31px; bottom: 11px; }
h3 { margin: 0; color: var(--text-main); font-size: 16px; font-weight: 600; }
p { margin: 0; max-width: 42ch; line-height: 1.6; }
.ghost-action {
  border: 1px solid var(--border-strong);
  color: var(--text-main);
  background: var(--bg-soft);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}
</style>
