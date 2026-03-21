'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const VIBES = [
  { id: 'bold',      label: 'Bold & Creative',   desc: 'Dark, editorial, striking typography', emoji: '🔥' },
  { id: 'minimal',   label: 'Clean & Minimal',    desc: 'Light, whitespace-heavy, refined',     emoji: '◻' },
  { id: 'dark',      label: 'Dark & Moody',       desc: 'Deep darks, neon accents, cinematic',  emoji: '🌑' },
  { id: 'corporate', label: 'Sharp & Corporate',  desc: 'Professional, structured, navy/gold',  emoji: '💼' },
  { id: 'retro',     label: 'Retro Futuristic',   desc: 'Brutalist grid, monospace, amber CRT', emoji: '📟' },
  { id: 'soft',      label: 'Soft & Editorial',   desc: 'Pastel tones, magazine layout',        emoji: '🌸' },
]

const EMPHASIS = [
  { id: 'skills',     label: 'Skills & Tools',      emoji: '🛠' },
  { id: 'experience', label: 'Work Experience',      emoji: '💼' },
  { id: 'projects',   label: 'Projects & Portfolio', emoji: '🚀' },
  { id: 'balanced',   label: 'Balanced Overview',    emoji: '⚖️' },
]

const ACCENTS = [
  { id: 'orange', label: 'Flame',  color: '#FF4B1F' },
  { id: 'teal',   label: 'Teal',   color: '#00D4A4' },
  { id: 'gold',   label: 'Gold',   color: '#F5C842' },
  { id: 'violet', label: 'Violet', color: '#8B5CF6' },
  { id: 'rose',   label: 'Rose',   color: '#F43F5E' },
  { id: 'sky',    label: 'Sky',    color: '#38BDF8' },
]

const LOADING_MESSAGES = [
  { text: 'Parsing your CV…',             sub: 'Extracting roles, skills and metrics' },
  { text: 'Choosing typography…',         sub: 'Finding fonts that match your vibe' },
  { text: 'Laying out the hero section…', sub: 'Making your name look great big' },
  { text: 'Styling the skills grid…',     sub: 'Turning your tools into badges' },
  { text: 'Bolding the good numbers…',    sub: 'Those metrics deserve to stand out' },
  { text: 'Adding hover effects…',        sub: 'Small details make a big difference' },
  { text: 'Building scroll animations…',  sub: 'Content that reveals as you read' },
  { text: 'Applying your accent color…',  sub: 'Tying the whole design together' },
  { text: 'Almost there…',               sub: 'Doing final polish on the layout' },
]

// ─── Types ────────────────────────────────────────────────────
interface CvData {
  name: string
  base64: string
  type: string
}

interface Prefs {
  vibe: string
  emphasis: string
  accent: string
}

// ─── Styles ───────────────────────────────────────────────────
const mono  = { fontFamily: "'Space Mono', monospace" } as React.CSSProperties
const black = { fontFamily: 'system-ui, sans-serif', fontWeight: 900 } as React.CSSProperties
const serif = { fontFamily: 'Georgia, serif' } as React.CSSProperties

const optStyle = (selected: boolean, color = '#FF4B1F'): React.CSSProperties => ({
  border: `1px solid ${selected ? color : '#2A2A2A'}`,
  background: selected ? `${color}18` : 'transparent',
  padding: '13px 16px',
  cursor: 'pointer',
  transition: 'all 0.18s',
  borderRadius: '2px',
})

// ─── Loading screen ───────────────────────────────────────────
function LoadingScreen({ accentColor }: { accentColor: string }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const prog = setInterval(() => {
      setProgress(p => p >= 92 ? p : p + (92 - p) * 0.04)
    }, 400)

    const msg = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length)
        setFade(true)
      }, 300)
    }, 2800)

    return () => { clearInterval(prog); clearInterval(msg) }
  }, [])

  const current = LOADING_MESSAGES[msgIndex]

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '40px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '40px' }}>
        <div style={{ position: 'absolute', inset: 0, border: '1px solid #1E1E1E', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '10px', border: '1px solid #1E1E1E', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: '10px', border: '1px solid transparent', borderTopColor: accentColor, borderRadius: '50%', opacity: 0.4, animation: 'spin 1.6s linear infinite reverse' }} />
      </div>

      <div style={{ textAlign: 'center', height: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ ...black, fontSize: '18px', color: '#F0EDE6', marginBottom: '8px', opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
          {current.text}
        </div>
        <div style={{ ...mono, fontSize: '11px', color: '#555', letterSpacing: '0.1em', opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease 0.05s' }}>
          {current.sub}
        </div>
      </div>

      <div style={{ width: '280px', height: '2px', background: '#1E1E1E', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: accentColor, width: `${progress}%`, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ ...mono, fontSize: '10px', color: '#333', marginTop: '10px', letterSpacing: '0.15em' }}>
        {Math.round(progress)}%
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
export default function CvVisualizer() {
  const [step, setStep]                   = useState<'upload' | 'style' | 'generating' | 'result'>('upload')
  const [cvData, setCvData]               = useState<CvData | null>(null)
  const [prefs, setPrefs]                 = useState<Prefs>({ vibe: 'bold', emphasis: 'balanced', accent: 'orange' })
  const [dragging, setDragging]           = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [error, setError]                 = useState<string | null>(null)
  const fileInputRef                      = useRef<HTMLInputElement>(null)

  const accentColor = ACCENTS.find(a => a.id === prefs.accent)?.color ?? '#FF4B1F'

  const handleFile = useCallback((file: File) => {
    if (!file) return
    const ok = file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.docx')
    if (!ok) { setError('Please upload a PDF or text file.'); return }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCvData({ name: file.name, base64: result.split(',')[1], type: file.type })
      setStep('style')
    }
    reader.readAsDataURL(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const generate = async () => {
    if (!cvData) return
    setStep('generating')
    setError(null)

    const vibeObj   = VIBES.find(v => v.id === prefs.vibe)!
    const emphObj   = EMPHASIS.find(e => e.id === prefs.emphasis)!
    const accentObj = ACCENTS.find(a => a.id === prefs.accent)!

    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvBase64: cvData.base64,
          cvMediaType: cvData.type === 'application/pdf' ? 'application/pdf' : 'text/plain',
          vibe: vibeObj.label,
          vibeDesc: vibeObj.desc,
          emphasis: emphObj.label,
          accentColor: accentObj.color,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      if (!data.html?.toLowerCase().includes('<html')) throw new Error('Unexpected response — please try again.')

      setGeneratedHtml(data.html)
      setStep('result')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('style')
    }
  }

  const download = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'my-cv.html'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => { setStep('upload'); setCvData(null); setGeneratedHtml(''); setError(null) }

  // ── Result ──────────────────────────────────────────────────
  if (step === 'result') return (
    <div style={{ background: '#0C0C0C', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', gap: '12px' }}>
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141414', border: '1px solid #2A2A2A', padding: '12px 20px' }}>
        <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase' }}>✓ Your CV is ready</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={reset}    style={{ ...mono, fontSize: '10px', padding: '8px 16px', background: 'transparent', border: '1px solid #2A2A2A', color: '#999', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>← Start Over</button>
          <button onClick={download} style={{ ...mono, fontSize: '10px', padding: '8px 16px', background: accentColor, border: 'none', color: '#fff', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⬇ Download HTML</button>
        </div>
      </div>
      <iframe srcDoc={generatedHtml} sandbox="allow-scripts allow-same-origin" style={{ width: '100%', maxWidth: '1200px', height: '80vh', border: '1px solid #2A2A2A' }} title="Generated CV" />
    </div>
  )

  // ── Generating ──────────────────────────────────────────────
  if (step === 'generating') return <LoadingScreen accentColor={accentColor} />

  // ── Form (upload + style) ───────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '680px', background: '#141414', border: '1px solid #2A2A2A', padding: '48px' }}>

        <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.3em', color: accentColor, textTransform: 'uppercase', marginBottom: '12px' }}>CV to Webpage</p>
        <h1 style={{ ...black, fontSize: '34px', lineHeight: 1.1, color: '#F0EDE6', marginBottom: '10px' }}>Turn your CV into<br />a visual masterpiece.</h1>
        <p style={{ ...serif, fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '40px' }}>Upload your resume, pick your style, get a stunning single-page HTML profile.</p>

        {/* UPLOAD */}
        {step === 'upload' && (
          <>
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Step 1 — Upload your CV</span>
            <div
              style={{ border: `2px dashed ${dragging ? accentColor : '#333'}`, background: dragging ? `${accentColor}08` : '#0C0C0C', padding: '44px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px', borderRadius: '2px' }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>📄</div>
              <div style={{ ...black, fontSize: '15px', color: '#F0EDE6', marginBottom: '8px' }}>Drop your CV here or click to browse</div>
              <div style={{ ...mono, fontSize: '10px', color: '#444', letterSpacing: '0.12em' }}>PDF · TXT · DOCX</div>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {error && <div style={{ ...mono, fontSize: '11px', color: '#FF4B1F', padding: '12px', border: '1px solid rgba(255,75,31,0.3)', background: 'rgba(255,75,31,0.05)' }}>⚠ {error}</div>}
          </>
        )}

        {/* STYLE */}
        {step === 'style' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.3em', color: accentColor, textTransform: 'uppercase', marginBottom: '6px' }}>Step 2 — Your Style</p>
                <p style={{ ...mono, fontSize: '11px', color: '#555' }}>📄 {cvData?.name}</p>
              </div>
              <button onClick={reset} style={{ ...mono, fontSize: '10px', padding: '7px 14px', background: 'transparent', border: '1px solid #2A2A2A', color: '#666', cursor: 'pointer' }}>← Change file</button>
            </div>

            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Visual Vibe</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {VIBES.map(v => (
                <div key={v.id} style={optStyle(prefs.vibe === v.id, accentColor)} onClick={() => setPrefs(p => ({ ...p, vibe: v.id }))}>
                  <div style={{ ...black, fontSize: '12px', color: '#F0EDE6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {v.emoji} {v.label}
                    {prefs.vibe === v.id && <span style={{ marginLeft: 'auto', color: accentColor }}>✓</span>}
                  </div>
                  <div style={{ ...mono, fontSize: '10px', color: '#555', lineHeight: 1.4 }}>{v.desc}</div>
                </div>
              ))}
            </div>

            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>What to Emphasize</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {EMPHASIS.map(e => (
                <div key={e.id} style={optStyle(prefs.emphasis === e.id, accentColor)} onClick={() => setPrefs(p => ({ ...p, emphasis: e.id }))}>
                  <div style={{ ...black, fontSize: '12px', color: '#F0EDE6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {e.emoji} {e.label}
                    {prefs.emphasis === e.id && <span style={{ marginLeft: 'auto', color: accentColor }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Accent Color</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '28px' }}>
              {ACCENTS.map(a => (
                <div key={a.id} style={optStyle(prefs.accent === a.id, a.color)} onClick={() => setPrefs(p => ({ ...p, accent: a.id }))}>
                  <div style={{ ...black, fontSize: '12px', color: '#F0EDE6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: a.color, display: 'inline-block', flexShrink: 0 }} />
                    {a.label}
                    {prefs.accent === a.id && <span style={{ marginLeft: 'auto', color: a.color }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ ...mono, fontSize: '11px', color: '#FF4B1F', padding: '12px', border: '1px solid rgba(255,75,31,0.3)', background: 'rgba(255,75,31,0.05)', marginBottom: '16px' }}>⚠ {error}</div>}

            <button onClick={generate} style={{ width: '100%', padding: '16px', background: accentColor, color: '#fff', border: 'none', ...black, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>
              Generate My CV →
            </button>
            <p style={{ ...mono, fontSize: '10px', color: '#444', textAlign: 'center', marginTop: '12px', letterSpacing: '0.1em' }}>Powered by Claude · ~15 seconds</p>
          </>
        )}
      </div>
    </div>
  )
}
