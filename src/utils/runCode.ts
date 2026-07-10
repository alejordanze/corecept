import { transform } from 'sucrase'
import type { CodeLanguage } from '../data/types'

export interface RunResult {
  logs: LogEntry[]
  error?: string
  durationMs: number
  timedOut?: boolean
}

export interface LogEntry {
  level: 'log' | 'info' | 'warn' | 'error'
  parts: string[]
}

const MAX_TIMER_WAIT_MS = 2000
const MAX_TIMER_DELAY_MS = 1500
const QUIET_POLL_MS = 50

function safeStringify(value: unknown, depth = 0): string {
  if (depth > 4) return '…'
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  if (typeof value === 'function') {
    const fn = value as (...args: unknown[]) => unknown
    return `[Function: ${fn.name || 'anonymous'}]`
  }
  if (typeof value === 'symbol') return value.toString()
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (Array.isArray(value)) {
    return `[${value.map((v) => safeStringify(v, depth + 1)).join(', ')}]`
  }
  if (typeof value === 'object') {
    try {
      const entries = Object.entries(value as Record<string, unknown>).map(
        ([k, v]) => `${k}: ${safeStringify(v, depth + 1)}`,
      )
      return `{ ${entries.join(', ')} }`
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function formatArgs(args: unknown[]): string[] {
  return args.map((a) => safeStringify(a))
}

function transpile(code: string, language: CodeLanguage): string {
  if (language === 'javascript') return code
  const result = transform(code, {
    transforms: ['typescript'],
    disableESTransforms: true,
  })
  return result.code
}

export async function runCode(source: string, language: CodeLanguage): Promise<RunResult> {
  const logs: LogEntry[] = []
  const pushLog = (level: LogEntry['level'], parts: unknown[]) => {
    logs.push({ level, parts: formatArgs(parts) })
  }

  const sandboxConsole = {
    log: (...args: unknown[]) => pushLog('log', args),
    info: (...args: unknown[]) => pushLog('info', args),
    warn: (...args: unknown[]) => pushLog('warn', args),
    error: (...args: unknown[]) => pushLog('error', args),
    debug: (...args: unknown[]) => pushLog('log', args),
    trace: (...args: unknown[]) => pushLog('log', args),
    table: (v: unknown) => pushLog('log', [v]),
    group: () => {},
    groupEnd: () => {},
    dir: (v: unknown) => pushLog('log', [v]),
  }

  // Track timers/intervals scheduled from user code so we can wait for them to
  // settle and clean anything still running before we return. Otherwise
  // callbacks fire after runCode has returned — logs get pushed but React
  // never re-renders because the array reference does not change.
  const timeoutIds = new Set<number>()
  const intervalIds = new Set<number>()

  const sandboxSetTimeout = (cb: (...args: unknown[]) => void, delay = 0, ...args: unknown[]) => {
    const clamped = Math.min(Math.max(delay | 0, 0), MAX_TIMER_DELAY_MS)
    const id = window.setTimeout(
      () => {
        timeoutIds.delete(id)
        try {
          cb(...args)
        } catch (e) {
          pushLog('error', [e])
        }
      },
      clamped,
    )
    timeoutIds.add(id)
    return id
  }
  const sandboxClearTimeout = (id: number) => {
    timeoutIds.delete(id)
    window.clearTimeout(id)
  }

  const sandboxSetInterval = (cb: (...args: unknown[]) => void, delay = 10, ...args: unknown[]) => {
    // Enforce a minimum delay of 1ms so `setInterval(fn, 0)` cannot fully
    // starve the wait loop, and cap the max to keep behaviour predictable.
    const clamped = Math.min(Math.max(delay | 0, 1), MAX_TIMER_DELAY_MS)
    const id = window.setInterval(() => {
      try {
        cb(...args)
      } catch (e) {
        pushLog('error', [e])
      }
    }, clamped)
    intervalIds.add(id)
    return id
  }
  const sandboxClearInterval = (id: number) => {
    intervalIds.delete(id)
    window.clearInterval(id)
  }

  const start = performance.now()

  try {
    const compiled = transpile(source, language)
    // Wrap in an async IIFE so top-level await works, and inject sandboxed
    // console/timer functions.
    const wrapped = `"use strict";\nreturn (async () => {\n${compiled}\n})();`
    const fn = new Function(
      'console',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      wrapped,
    ) as (
      c: typeof sandboxConsole,
      st: typeof sandboxSetTimeout,
      ct: typeof sandboxClearTimeout,
      si: typeof sandboxSetInterval,
      ci: typeof sandboxClearInterval,
    ) => Promise<unknown>

    await fn(
      sandboxConsole,
      sandboxSetTimeout,
      sandboxClearTimeout,
      sandboxSetInterval,
      sandboxClearInterval,
    )

    // Wait until nothing is pending — or the hard cap trips. Intervals never
    // "drain" on their own, so if any exist we always end up hitting the cap
    // unless user code clears them.
    let timedOut = false
    if (timeoutIds.size > 0 || intervalIds.size > 0) {
      const quiet = new Promise<void>((resolve) => {
        const check = () => {
          if (timeoutIds.size === 0 && intervalIds.size === 0) resolve()
          else window.setTimeout(check, QUIET_POLL_MS)
        }
        check()
      })
      const cap = new Promise<void>((resolve) =>
        window.setTimeout(() => {
          timedOut = true
          resolve()
        }, MAX_TIMER_WAIT_MS),
      )
      await Promise.race([quiet, cap])
    }

    // Force-stop anything still running so it cannot mutate logs after we
    // return and leak into the next run.
    for (const id of timeoutIds) window.clearTimeout(id)
    timeoutIds.clear()
    for (const id of intervalIds) window.clearInterval(id)
    intervalIds.clear()

    return { logs, durationMs: performance.now() - start, timedOut }
  } catch (err) {
    for (const id of timeoutIds) window.clearTimeout(id)
    timeoutIds.clear()
    for (const id of intervalIds) window.clearInterval(id)
    intervalIds.clear()
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    return { logs, error: message, durationMs: performance.now() - start }
  }
}
