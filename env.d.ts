/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, object, any>
  export default component
}

// Service Worker and Background Sync types
interface SyncEvent extends ExtendableEvent {
  readonly tag: string
}

interface ServiceWorkerRegistration {
  sync: {
    register(tag: string): Promise<void>
  }
}

interface ServiceWorkerGlobalScope {
  onsync: ((this: ServiceWorkerGlobalScope, ev: SyncEvent) => any) | null
}
