'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Options ─────────────────────────────────────────────────
const LAYOUTS = [
  { id: 'spotlight', label: 'Spotlight',  desc: 'Fixed sidebar + scrollable content' },
  { id: 'editorial', label: 'Editorial',  desc: 'Centered column, content-first' },
  { id: 'showcase',  label: 'Showcase',   desc: 'Full-width hero + card sections' },
]

const TONES = [
  { id: 'refined',   label: 'Refined',   desc: 'Restrained, elegant, serif accents',    font: "'Playfair Display', serif",    sample: 'Elegant & considered.' },
  { id: 'technical', label: 'Technical',  desc: 'Structured, data-forward, monospace',   font: "'JetBrains Mono', monospace",  sample: 'Precise & systematic.' },
  { id: 'creative',  label: 'Creative',   desc: 'Bold typography, editorial flair',      font: "'Archivo Black', sans-serif",  sample: 'Bold & expressive.' },
  { id: 'warm',      label: 'Warm',       desc: 'Friendly, rounded, approachable',       font: "'DM Sans', sans-serif",        sample: 'Open & inviting.' },
]

const ACCENTS = [
  { id: 'flame',  label: 'Flame',  color: '#FF4B1F' },
  { id: 'teal',   label: 'Teal',   color: '#00D4A4' },
  { id: 'gold',   label: 'Gold',   color: '#F5C842' },
  { id: 'violet', label: 'Violet', color: '#8B5CF6' },
  { id: 'rose',   label: 'Rose',   color: '#F43F5E' },
  { id: 'sky',    label: 'Sky',    color: '#38BDF8' },
]

const LOADING_MESSAGES = [
  { text: 'Parsing your CV...',             sub: 'Extracting roles, skills and metrics' },
  { text: 'Building the design system...',  sub: 'Type scale, spacing, color palette' },
  { text: 'Choosing typography...',         sub: 'Pairing fonts that match your tone' },
  { text: 'Laying out sections...',         sub: 'Structuring your content hierarchy' },
  { text: 'Styling the skills grid...',     sub: 'Turning your tools into visual badges' },
  { text: 'Adding interactions...',         sub: 'Subtle hovers and scroll reveals' },
  { text: 'Tuning the color palette...',    sub: 'Balancing contrast and accent usage' },
  { text: 'Polishing whitespace...',        sub: 'Breathing room makes design sing' },
  { text: 'Almost there...',               sub: 'Final responsive adjustments' },
]

// ─── Types ───────────────────────────────────────────────────
interface CvData { name: string; base64: string; type: string }
interface StylePrefs { layout: string; tone: string; mode: string; accent: string }

// ─── Base styles ─────────────────────────────────────────────
const mono  = { fontFamily: "'Space Mono', monospace" } as React.CSSProperties
const heading = { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700 } as React.CSSProperties
const body  = { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 } as React.CSSProperties

// ─── Layout mini-mockups ─────────────────────────────────────
function LayoutMockup({ type, selected, accent }: { type: string; selected: boolean; accent: string }) {
  const bar = selected ? accent : '#333'
  const bg  = selected ? `${accent}10` : '#1A1A1A'
  const dim = selected ? `${accent}30` : '#2A2A2A'
  const line = selected ? `${accent}50` : '#333'

  const common: React.CSSProperties = {
    width: '100%', aspectRatio: '16/10', background: bg, borderRadius: '4px',
    border: `1px solid ${selected ? accent : '#2A2A2A'}`, padding: '10px',
    display: 'flex', overflow: 'hidden', position: 'relative',
  }

  if (type === 'spotlight') {
    return (
      <div style={{ ...common, gap: '8px' }}>
        {/* Sidebar */}
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ width: '70%', height: '6px', background: bar, borderRadius: '2px' }} />
          <div style={{ width: '50%', height: '4px', background: dim, borderRadius: '2px' }} />
          <div style={{ flex: 1 }} />
          {[1,2,3].map(i => <div key={i} style={{ width: '60%', height: '3px', background: line, borderRadius: '2px' }} />)}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '3px' }}>
            {[1,2,3].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: dim }} />)}
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', borderLeft: `1px solid ${dim}`, paddingLeft: '8px' }}>
          <div style={{ width: '80%', height: '4px', background: line, borderRadius: '2px' }} />
          <div style={{ width: '100%', height: '3px', background: dim, borderRadius: '2px' }} />
          <div style={{ width: '90%', height: '3px', background: dim, borderRadius: '2px' }} />
          <div style={{ height: '6px' }} />
          <div style={{ width: '60%', height: '4px', background: line, borderRadius: '2px' }} />
          <div style={{ width: '100%', height: '3px', background: dim, borderRadius: '2px' }} />
          <div style={{ width: '75%', height: '3px', background: dim, borderRadius: '2px' }} />
        </div>
      </div>
    )
  }

  if (type === 'editorial') {
    return (
      <div style={{ ...common, justifyContent: 'center' }}>
        <div style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
          <div style={{ width: '50%', height: '6px', background: bar, borderRadius: '2px' }} />
          <div style={{ width: '35%', height: '4px', background: dim, borderRadius: '2px' }} />
          <div style={{ height: '6px' }} />
          <div style={{ width: '100%', height: '3px', background: line, borderRadius: '2px' }} />
          <div style={{ width: '90%', height: '3px', background: dim, borderRadius: '2px' }} />
          <div style={{ width: '95%', height: '3px', background: dim, borderRadius: '2px' }} />
          <div style={{ height: '6px' }} />
          <div style={{ width: '100%', height: '3px', background: line, borderRadius: '2px' }} />
          <div style={{ width: '80%', height: '3px', background: dim, borderRadius: '2px' }} />
        </div>
      </div>
    )
  }

  // showcase
  return (
    <div style={{ ...common, flexDirection: 'column', gap: '6px' }}>
      {/* Hero */}
      <div style={{ width: '100%', height: '35%', background: dim, borderRadius: '3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <div style={{ width: '40%', height: '5px', background: bar, borderRadius: '2px' }} />
        <div style={{ width: '25%', height: '3px', background: line, borderRadius: '2px' }} />
      </div>
      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', flex: 1 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: dim, borderRadius: '3px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ width: '70%', height: '3px', background: line, borderRadius: '2px' }} />
            <div style={{ width: '90%', height: '2px', background: `${line}80`, borderRadius: '2px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Live style preview ──────────────────────────────────────
function StylePreview({ prefs }: { prefs: StylePrefs }) {
  const accent = ACCENTS.find(a => a.id === prefs.accent)?.color ?? '#FF4B1F'
  const tone = TONES.find(t => t.id === prefs.tone)
  const dark = prefs.mode === 'dark'

  const bg       = dark ? '#111' : '#FAFAF8'
  const bgRaised = dark ? '#1A1A1A' : '#FFFFFF'
  const text     = dark ? '#E8E4DD' : '#1A1A1A'
  const muted    = dark ? '#888' : '#666'
  const faint    = dark ? '#444' : '#CCC'
  const headingFont = tone?.font ?? "'Inter', sans-serif"

  return (
    <div style={{
      background: bg, borderRadius: '6px', border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`,
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.2em', color: muted, textTransform: 'uppercase' }}>
        Preview
      </div>

      {/* Name + title */}
      <div>
        <div style={{ fontFamily: headingFont, fontSize: '22px', fontWeight: 700, color: text, lineHeight: 1.2 }}>
          Your Name
        </div>
        <div style={{ fontFamily: headingFont, fontSize: '13px', color: accent, marginTop: '4px', fontWeight: 500 }}>
          Your Title
        </div>
      </div>

      {/* Bio line */}
      <div style={{ fontSize: '12px', color: muted, lineHeight: 1.6, ...body }}>
        A short bio line extracted from your CV, setting the tone for everything below.
      </div>

      {/* Section header */}
      <div style={{ borderTop: `1px solid ${faint}`, paddingTop: '12px' }}>
        <div style={{ fontFamily: headingFont, fontSize: '11px', fontWeight: 600, color: text, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Experience
        </div>
        {/* Card */}
        <div style={{ background: bgRaised, border: `1px solid ${faint}`, borderRadius: '4px', padding: '12px', transition: 'all 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{ fontFamily: headingFont, fontSize: '12px', fontWeight: 600, color: text }}>Senior Role</span>
            <span style={{ ...mono, fontSize: '9px', color: muted }}>2023-25</span>
          </div>
          <div style={{ fontSize: '11px', color: muted, lineHeight: 1.5, ...body }}>
            Company Name
          </div>
        </div>
      </div>

      {/* Skill badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['React', 'TypeScript', 'Node.js'].map(s => (
          <span key={s} style={{
            ...mono, fontSize: '9px', padding: '3px 8px',
            background: `${accent}15`, color: accent, borderRadius: '3px',
            border: `1px solid ${accent}30`, letterSpacing: '0.03em',
          }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Loading screen ──────────────────────────────────────────
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '40px' }}>
        <div style={{ position: 'absolute', inset: 0, border: '1px solid #1E1E1E', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '10px', border: '1px solid #1E1E1E', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: '10px', border: '1px solid transparent', borderTopColor: accentColor, borderRadius: '50%', opacity: 0.4, animation: 'spin 1.6s linear infinite reverse' }} />
      </div>
      <div style={{ textAlign: 'center', height: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ ...heading, fontSize: '18px', color: '#F0EDE6', marginBottom: '8px', opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
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

// ─── Main component ──────────────────────────────────────────
export default function CvVisualizer() {
  const [step, setStep]       = useState<'upload' | 'style' | 'generating' | 'result'>('upload')
  const [cvData, setCvData]   = useState<CvData | null>(null)
  const [prefs, setPrefs]     = useState<StylePrefs>({ layout: 'spotlight', tone: 'refined', mode: 'dark', accent: 'teal' })
  const [dragging, setDragging] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [showHosting, setShowHosting] = useState(false)
  const fileInputRef          = useRef<HTMLInputElement>(null)

  const accentColor = ACCENTS.find(a => a.id === prefs.accent)?.color ?? '#00D4A4'

  const handleFile = useCallback((file: File) => {
    if (!file) return
    const ok = file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.txt')
    if (!ok) { setError('Please upload a PDF or plain text file.'); return }
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
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const generate = async () => {
    if (!cvData) return
    setStep('generating'); setError(null)

    const layout = LAYOUTS.find(l => l.id === prefs.layout)!
    const tone   = TONES.find(t => t.id === prefs.tone)!
    const accent = ACCENTS.find(a => a.id === prefs.accent)!

    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvBase64: cvData.base64,
          cvMediaType: cvData.type === 'application/pdf' ? 'application/pdf' : 'text/plain',
          layout: layout.id,
          layoutLabel: layout.label,
          tone: tone.id,
          toneLabel: tone.label,
          toneDesc: tone.desc,
          mode: prefs.mode,
          accentColor: accent.color,
          accentLabel: accent.label,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      if (!data.html?.toLowerCase().includes('<html')) throw new Error('Unexpected response - please try again.')
      setGeneratedHtml(data.html)
      setStep('result')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('style')
    }
  }

  const download = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'my-webpage.html'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => { setStep('upload'); setCvData(null); setGeneratedHtml(''); setError(null); setShowHosting(false) }

  // ── RESULT SCREEN ──────────────────────────────────────────
  if (step === 'result') return (
    <div style={{ background: '#0C0C0C', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', gap: '12px' }}>
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141414', border: '1px solid #2A2A2A', padding: '12px 20px' }}>
        <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase' }}>Your webpage is ready</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={reset} style={{ ...mono, fontSize: '10px', padding: '8px 16px', background: 'transparent', border: '1px solid #2A2A2A', color: '#999', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Start Over</button>
          <button onClick={download} style={{ ...mono, fontSize: '10px', padding: '8px 16px', background: accentColor, border: 'none', color: '#fff', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Download HTML</button>
        </div>
      </div>

      {/* Preview */}
      <iframe srcDoc={generatedHtml} sandbox="allow-scripts allow-same-origin" style={{ width: '100%', maxWidth: '1200px', height: '75vh', border: '1px solid #2A2A2A', borderRadius: '2px' }} title="Generated Webpage" />

      {/* Hosting guide */}
      <div style={{ width: '100%', maxWidth: '1200px', background: '#141414', border: '1px solid #2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
        <button
          onClick={() => setShowHosting(!showHosting)}
          style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span style={{ ...heading, fontSize: '13px', color: '#F0EDE6' }}>Want to put this online?</span>
          <span style={{ ...mono, fontSize: '12px', color: '#555', transform: showHosting ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>v</span>
        </button>

        {showHosting && (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {/* Step 1 */}
              <div style={{ background: '#0C0C0C', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '16px' }}>
                <div style={{ ...mono, fontSize: '10px', color: accentColor, letterSpacing: '0.15em', marginBottom: '8px' }}>01</div>
                <div style={{ ...heading, fontSize: '12px', color: '#F0EDE6', marginBottom: '6px' }}>Get a domain</div>
                <div style={{ ...body, fontSize: '11px', color: '#666', lineHeight: 1.6 }}>
                  Pick a name like <span style={{ color: '#999' }}>yourname.com</span> from Namecheap, Porkbun, or Cloudflare Registrar. Usually $9-12/year.
                </div>
              </div>
              {/* Step 2 */}
              <div style={{ background: '#0C0C0C', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '16px' }}>
                <div style={{ ...mono, fontSize: '10px', color: accentColor, letterSpacing: '0.15em', marginBottom: '8px' }}>02</div>
                <div style={{ ...heading, fontSize: '12px', color: '#F0EDE6', marginBottom: '6px' }}>Host for free</div>
                <div style={{ ...body, fontSize: '11px', color: '#666', lineHeight: 1.6 }}>
                  Drag your HTML file to <span style={{ color: '#999' }}>netlify.com/drop</span> for instant hosting. Or use GitHub Pages or Vercel.
                </div>
              </div>
              {/* Step 3 */}
              <div style={{ background: '#0C0C0C', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '16px' }}>
                <div style={{ ...mono, fontSize: '10px', color: accentColor, letterSpacing: '0.15em', marginBottom: '8px' }}>03</div>
                <div style={{ ...heading, fontSize: '12px', color: '#F0EDE6', marginBottom: '6px' }}>Connect domain</div>
                <div style={{ ...body, fontSize: '11px', color: '#666', lineHeight: 1.6 }}>
                  Point your domain to your host. Netlify and Vercel make this one-click. You're live.
                </div>
              </div>
            </div>
            <div style={{ ...mono, fontSize: '10px', color: '#444', textAlign: 'center', letterSpacing: '0.1em' }}>
              Your page is a single HTML file — it works anywhere, no server needed.
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── GENERATING SCREEN ──────────────────────────────────────
  if (step === 'generating') return <LoadingScreen accentColor={accentColor} />

  // ── UPLOAD + STYLE FORM ────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: step === 'style' ? '960px' : '680px', transition: 'max-width 0.3s ease' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: step === 'upload' ? 'center' : 'left' }}>
          <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.3em', color: accentColor, textTransform: 'uppercase', marginBottom: '12px' }}>CV to Webpage</p>
          <h1 style={{ ...heading, fontSize: step === 'upload' ? '38px' : '28px', lineHeight: 1.1, color: '#F0EDE6', marginBottom: '10px', transition: 'font-size 0.3s ease' }}>
            {step === 'upload' ? <>Turn your CV into<br />a personal webpage.</> : 'Choose your style.'}
          </h1>
          <p style={{ fontFamily: "'Lora', serif", fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
            {step === 'upload'
              ? 'Upload your resume and we\'ll build a stunning, single-file HTML page you can host anywhere.'
              : 'Pick a layout, tone, and palette. The preview updates live so you can feel the direction before we build.'}
          </p>
        </div>

        {/* ── UPLOAD STEP ─────────────────────────────────────── */}
        {step === 'upload' && (
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div
              style={{
                border: `2px dashed ${dragging ? accentColor : '#333'}`,
                background: dragging ? `${accentColor}08` : '#141414',
                padding: '52px 40px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s', borderRadius: '4px', marginBottom: '16px',
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.8 }}>&#8593;</div>
              <div style={{ ...heading, fontSize: '16px', color: '#F0EDE6', marginBottom: '8px' }}>
                Drop your CV here or click to browse
              </div>
              <div style={{ ...mono, fontSize: '10px', color: '#555', letterSpacing: '0.12em', marginBottom: '16px' }}>
                PDF or TXT
              </div>
              <div style={{ ...body, fontSize: '12px', color: '#444', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto', borderTop: '1px solid #2A2A2A', paddingTop: '14px' }}>
                PDF is recommended — we read the formatting, sections, and layout exactly as you designed them.
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {error && <div style={{ ...mono, fontSize: '11px', color: '#FF4B1F', padding: '12px', border: '1px solid rgba(255,75,31,0.3)', background: 'rgba(255,75,31,0.05)', borderRadius: '3px' }}>! {error}</div>}
          </div>
        )}

        {/* ── STYLE STEP ──────────────────────────────────────── */}
        {step === 'style' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
            {/* Left: options */}
            <div style={{ background: '#141414', border: '1px solid #2A2A2A', padding: '32px', borderRadius: '4px' }}>

              {/* File info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #1E1E1E' }}>
                <div style={{ ...mono, fontSize: '11px', color: '#666' }}>{cvData?.name}</div>
                <button onClick={reset} style={{ ...mono, fontSize: '10px', padding: '5px 12px', background: 'transparent', border: '1px solid #2A2A2A', color: '#666', cursor: 'pointer', borderRadius: '2px' }}>Change</button>
              </div>

              {/* Layout */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Layout</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {LAYOUTS.map(l => (
                    <div
                      key={l.id}
                      onClick={() => setPrefs(p => ({ ...p, layout: l.id }))}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <LayoutMockup type={l.id} selected={prefs.layout === l.id} accent={accentColor} />
                      <div style={{ ...heading, fontSize: '11px', color: prefs.layout === l.id ? '#F0EDE6' : '#777', marginTop: '8px', textAlign: 'center', transition: 'color 0.2s' }}>
                        {l.label}
                      </div>
                      <div style={{ ...body, fontSize: '9px', color: '#555', textAlign: 'center', marginTop: '2px' }}>
                        {l.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Tone</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {TONES.map(t => {
                    const sel = prefs.tone === t.id
                    return (
                      <div
                        key={t.id}
                        onClick={() => setPrefs(p => ({ ...p, tone: t.id }))}
                        style={{
                          border: `1px solid ${sel ? accentColor : '#2A2A2A'}`,
                          background: sel ? `${accentColor}10` : 'transparent',
                          padding: '14px', cursor: 'pointer', transition: 'all 0.18s', borderRadius: '3px',
                        }}
                      >
                        <div style={{ fontFamily: t.font, fontSize: '14px', color: sel ? '#F0EDE6' : '#999', marginBottom: '4px', lineHeight: 1.3 }}>
                          {t.sample}
                        </div>
                        <div style={{ ...heading, fontSize: '10px', color: sel ? accentColor : '#666', marginBottom: '2px' }}>
                          {t.label}
                        </div>
                        <div style={{ ...mono, fontSize: '9px', color: '#555' }}>{t.desc}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mode + Accent row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Mode */}
                <div>
                  <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Mode</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['dark', 'light'] as const).map(m => {
                      const sel = prefs.mode === m
                      return (
                        <div
                          key={m}
                          onClick={() => setPrefs(p => ({ ...p, mode: m }))}
                          style={{
                            flex: 1, padding: '10px', cursor: 'pointer', borderRadius: '3px',
                            border: `1px solid ${sel ? accentColor : '#2A2A2A'}`,
                            background: m === 'dark' ? (sel ? '#1A1A1A' : '#111') : (sel ? '#F0EDE6' : '#E8E4DD'),
                            transition: 'all 0.18s', textAlign: 'center',
                          }}
                        >
                          <div style={{ ...heading, fontSize: '10px', color: m === 'dark' ? (sel ? '#F0EDE6' : '#666') : (sel ? '#1A1A1A' : '#999') }}>
                            {m === 'dark' ? 'Dark' : 'Light'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Accent */}
                <div>
                  <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Accent</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                    {ACCENTS.map(a => {
                      const sel = prefs.accent === a.id
                      return (
                        <div
                          key={a.id}
                          onClick={() => setPrefs(p => ({ ...p, accent: a.id }))}
                          title={a.label}
                          style={{
                            width: '100%', aspectRatio: '1', borderRadius: '50%', background: a.color,
                            cursor: 'pointer', transition: 'all 0.18s',
                            boxShadow: sel ? `0 0 0 2px #0C0C0C, 0 0 0 4px ${a.color}` : 'none',
                            opacity: sel ? 1 : 0.5,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && <div style={{ ...mono, fontSize: '11px', color: '#FF4B1F', padding: '12px', border: '1px solid rgba(255,75,31,0.3)', background: 'rgba(255,75,31,0.05)', marginTop: '16px', borderRadius: '3px' }}>! {error}</div>}

              {/* Generate button */}
              <button
                onClick={generate}
                style={{
                  width: '100%', padding: '16px', marginTop: '24px',
                  background: accentColor, color: '#fff', border: 'none',
                  ...heading, fontSize: '13px', letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer', borderRadius: '3px',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Generate My Webpage
              </button>
              <p style={{ ...mono, fontSize: '10px', color: '#444', textAlign: 'center', marginTop: '10px', letterSpacing: '0.1em' }}>
                Powered by Claude ~ 30 seconds
              </p>
            </div>

            {/* Right: live preview */}
            <div style={{ position: 'sticky', top: '40px' }}>
              <StylePreview prefs={prefs} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
