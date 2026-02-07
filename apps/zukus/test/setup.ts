import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Patch happy-dom's CSSStyleDeclaration to support indexed property writes.
// react-dom (v19) sets `element.style[index] = value` which happy-dom doesn't support
// because its CSSStyleDeclaration only defines an indexed getter.
// We define a setter on the prototype for numeric string indices.
if (typeof CSSStyleDeclaration !== 'undefined') {
  const proto = CSSStyleDeclaration.prototype

  // Define numeric index setters (react-dom typically uses indices 0-50)
  for (let i = 0; i < 100; i++) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, i)
    if (descriptor && !descriptor.set) {
      Object.defineProperty(proto, i, {
        ...descriptor,
        set(_value: string) {
          // no-op: happy-dom doesn't need this for test assertions
        },
      })
    } else if (!descriptor) {
      Object.defineProperty(proto, i, {
        get() { return '' },
        set(_value: string) { /* no-op */ },
        configurable: true,
      })
    }
  }
}

// Suppress specific warnings from react-native-web style handling in happy-dom
const origWarn = console.warn
console.warn = (...args: any[]) => {
  const msg = args[0]?.toString?.() ?? ''
  if (msg.includes('shadow*')) return
  origWarn(...args)
}

afterEach(() => {
  cleanup()
})
