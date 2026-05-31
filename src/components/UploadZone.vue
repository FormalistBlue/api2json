<script setup lang="ts">
import { ref } from 'vue'
import { NIcon } from 'naive-ui'
import { Upload } from '@vicons/carbon'
import { gsap } from 'gsap'

const emit = defineEmits<{ file: [file: File] }>()
const isDragging = ref(false)
const zoneRef = ref<HTMLElement | null>(null)

function acceptFile(file?: File) {
  if (!file) return
  emit('file', file)
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  acceptFile(input.files?.[0])
  input.value = ''
}

function onDrag(on: boolean) {
  isDragging.value = on
  if (zoneRef.value) {
    gsap.to(zoneRef.value, {
      scale: on ? 1.01 : 1,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
}
</script>

<template>
  <label
    ref="zoneRef"
    class="upload-zone"
    :class="{ active: isDragging }"
    @dragenter.prevent="onDrag(true)"
    @dragover.prevent="onDrag(true)"
    @dragleave.prevent="onDrag(false)"
    @drop.prevent="(event) => { onDrag(false); acceptFile(event.dataTransfer?.files?.[0]) }"
  >
    <input type="file" accept=".json,application/json" @change="onInput" />
    <span class="upload-icon"><NIcon :component="Upload" size="18" /></span>
    <span>导入 JSON</span>
  </label>
</template>

<style scoped>
.upload-zone {
  --scan-x: 0%;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  background: linear-gradient(135deg, #0f766e, #0d9488);
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  box-shadow: 0 4px 14px rgba(15, 118, 110, 0.25);
  transition: box-shadow .2s ease, transform .15s ease;
}
.upload-zone::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.22), transparent);
  transform: translateX(-120%);
  transition: transform 0.45s cubic-bezier(.16,1,.3,1);
}
.upload-zone:hover { box-shadow: 0 6px 20px rgba(15, 118, 110, 0.35); transform: translateY(-1px); }
.upload-zone:hover::after, .upload-zone.active::after { transform: translateX(120%); }
.upload-zone input { display: none; }
.upload-icon { display: inline-flex; }
[data-theme='dark'] .upload-zone {
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  box-shadow: 0 4px 14px rgba(20, 184, 166, 0.2);
}
[data-theme='dark'] .upload-zone:hover {
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.3);
}
</style>
