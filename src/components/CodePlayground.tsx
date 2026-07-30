import { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import type { CodeLanguage } from '../data/types'
import { runCode, type LogEntry, type RunResult } from '../utils/runCode'

const Editor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.default })),
)

interface CodePlaygroundProps {
  initialCode: string
  language: CodeLanguage
  hint?: string
}

const levelStyles: Record<LogEntry['level'], string> = {
  log: 'text-slate-100',
  info: 'text-sky-300',
  warn: 'text-amber-300',
  error: 'text-rose-300',
}

export function CodePlayground({ initialCode, language, hint }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)

  const monacoLang = useMemo(
    () => (language === 'typescript' ? 'typescript' : 'javascript'),
    [language],
  )

  const handleRun = useCallback(async () => {
    setRunning(true)
    try {
      setResult(await runCode(code, language))
    } finally {
      setRunning(false)
    }
  }, [code, language])

  const handleReset = useCallback(() => {
    setCode(initialCode)
    setResult(null)
  }, [initialCode])

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs uppercase text-slate-300">
            {language}
          </span>
          <span className="text-sm text-slate-400">Editable playground</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <div className="h-72 bg-[#1e1e1e]">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading editor...
            </div>
          }
        >
          <Editor
            height="100%"
            aria-label="Exercise code editor"
            defaultLanguage={monacoLang}
            language={monacoLang}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              tabSize: 2,
              automaticLayout: true,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
            }}
          />
        </Suspense>
      </div>

      <div aria-live="polite" className="border-t border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase text-slate-500">Output</span>
          {result && (
            <span className="flex items-center gap-2 text-xs text-slate-500">
              {result.timedOut && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                  timer cap hit
                </span>
              )}
              <span>{result.durationMs.toFixed(1)}ms</span>
            </span>
          )}
        </div>
        {result ? (
          <div className="space-y-1 font-mono text-[13px] leading-relaxed">
            {result.logs.length === 0 && !result.error && (
              <div className="text-slate-500">(no console output)</div>
            )}
            {result.logs.map((entry, i) => (
              <div key={i} className={levelStyles[entry.level]}>
                {entry.parts.join(' ')}
              </div>
            ))}
            {result.error && (
              <div className="mt-2 rounded-md border border-rose-900/60 bg-rose-950/40 p-2 text-rose-300">
                {result.error}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500">Press Run to execute the code.</div>
        )}
      </div>

      {hint && (
        <div className="border-t border-slate-800 bg-slate-900/40 px-4 py-2 text-xs text-slate-400">
          <span className="text-slate-300">Hint:</span> {hint}
        </div>
      )}
    </div>
  )
}
