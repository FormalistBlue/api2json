import { onMounted, onUnmounted, type Ref } from 'vue'
import { gsap } from 'gsap'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useAppEnter(root: Ref<HTMLElement | null>) {
  if (prefersReducedMotion) return

  let ctx: gsap.Context | undefined
  onMounted(() => {
    if (!root.value) return
    ctx = gsap.context(() => {
      gsap.set('[data-enter]', { opacity: 0, y: -12 })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.5, force3D: true } })
      tl.to('[data-enter="top"]', { opacity: 1, y: 0 })
        .to('[data-enter="command"]', { opacity: 1, y: 0 }, '<0.1')
        .to('[data-enter="panel"]', { opacity: 1, y: 0, stagger: 0.06 }, '<0.04')
        .to('[data-enter="rail"]', { opacity: 1, y: 0, stagger: 0.05 }, '<0.04')
    }, root.value)
    onUnmounted(() => ctx?.revert())
  })
}

export function animateList(container: HTMLElement | null) {
  if (!container || prefersReducedMotion) return

  requestAnimationFrame(() => {
    const items = gsap.utils.toArray<HTMLElement>('[data-list-item]', container)
    if (items.length === 0) return

    const useStagger = items.length <= 30
    gsap.set(items, { opacity: 0, y: 6 })
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.28,
      stagger: useStagger ? 0.02 : 0,
      ease: 'power2.out',
      force3D: true,
      overwrite: 'auto',
    })
  })
}

export function animateNumber(el: HTMLElement | null, value: number) {
  if (!el) return
  const state = { value: Number(el.dataset.value || 0) }
  gsap.to(state, {
    value,
    duration: 0.3,
    ease: 'power2.out',
    overwrite: 'auto',
    force3D: true,
    onUpdate: () => {
      el.textContent = Math.round(state.value).toString()
      el.dataset.value = String(Math.round(state.value))
    },
  })
}

export function flashExport(el: HTMLElement | null) {
  if (!el) return
  gsap.fromTo(el, { '--shine-x': '-120%' }, { '--shine-x': '140%', duration: 0.7, ease: 'power3.out' })
  gsap.fromTo(el, { scale: 0.98 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' })
}
