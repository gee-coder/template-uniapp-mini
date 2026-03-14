import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $u: Record<string, unknown>
  }
}

