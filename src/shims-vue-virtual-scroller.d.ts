declare module 'vue-virtual-scroller' {
  import { DefineComponent } from 'vue'
  export const RecycleScroller: DefineComponent<{
    items: unknown[]
    itemSize?: number
    keyField?: string
    direction?: 'vertical' | 'horizontal'
  }>
  export const DynamicScroller: DefineComponent
  export const DynamicScrollerItem: DefineComponent
  export const IdState: () => unknown
}
