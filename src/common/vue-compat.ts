import * as VueRuntime from 'vue/dist/vue.runtime.esm-browser.js'

export * from 'vue/dist/vue.runtime.esm-browser.js'

export const isInSSRComponentSetup = false
export function injectHook(...args: unknown[]) {
  return args[1]
}
export default VueRuntime
