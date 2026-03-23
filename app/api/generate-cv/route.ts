import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Layout specifications ──────────────────────────────────
const LAYOUT_SPECS: Record<string, string> = {
  spotlight: `LAYOUT — SPOTLIGHT (two-column, fixed sidebar):
- Left sidebar: fixed position, width ~300px, full viewport height.
  Contains: name (large, prominent), title/role below, a short 2-3 sentence bio paragraph,
  vertical navigation links (About, Experience, Skills, Projects — whatever sections exist),
  social icon links (extract any URLs from the CV) at the bottom.
- Right content area: scrollable, with left margin clearing the sidebar, generous padding.
  All content sections flow here vertically.
- Navigation in sidebar MUST highlight the active section on scroll using IntersectionObserver.
  Each nav link gets a subtle indicator (line, dot, or color change) when its section is in view.
- The sidebar should have a slightly different background shade for depth.
- On mobile (<768px): sidebar becomes a compact top header, content goes full-width.
  Nav becomes a horizontal row or hamburger menu.`,

  editorial: `LAYOUT — EDITORIAL (centered single column):
- Single centered column, max-width: 720px, with generous auto margins.
- Top area: name and title, elegant and minimal. No sidebar, no sticky nav.
- Sections flow vertically with generous spacing (min 4rem between major sections).
- Use subtle section dividers (thin lines, extra whitespace, or small ornamental elements).
- This layout is about reading flow — treat it like a beautifully typeset magazine page.
- Typography does the heavy lifting here. Use size, weight, and spacing for hierarchy.
- On mobile: maintain centered layout, reduce horizontal padding.`,

  showcase: `LAYOUT — SHOWCASE (full-width hero + card sections):
- Hero section: full viewport width and at least 60vh tall, vertically centered name/title/tagline.
  Hero can have a subtle gradient, pattern, or texture background for depth.
- Below hero: content sections with alternating subtle background shifts (e.g. --bg and --bg-raised).
- Experience and projects displayed as card grids (2-3 columns on desktop).
  Cards should have clear borders or shadows, hover effects (lift + shadow increase), and consistent sizing.
- Sticky top navigation bar with section links, semi-transparent background with backdrop-blur.
- On mobile: single column cards, hero scales down, nav stays sticky.`,
}

// ─── Tone specifications ────────────────────────────────────
const TONE_SPECS: Record<string, string> = {
  refined: `TONE — REFINED:
- Heading font: a elegant serif like Playfair Display, Cormorant Garamond, or Libre Baskerville.
- Body font: a clean sans-serif like Inter, Source Sans 3, or Work Sans.
- Extra whitespace everywhere — let the design breathe. Padding should feel generous.
- Colors should be muted and desaturated. Accent is used sparingly — links and small highlights only.
- Subtle details: thin borders (0.5px-1px), letter-spacing on uppercase labels, gentle opacity transitions.
- No bold animations. Transitions should be 0.2-0.3s ease. Understated elegance.`,

  technical: `TONE — TECHNICAL:
- Heading font: a geometric sans like Space Grotesk, Outfit, or Syne.
- Code/label font: a monospace like JetBrains Mono or Space Mono — use for dates, labels, tags.
- Structured and systematic. Use consistent grid alignment. Data should feel organized.
- Skill badges and tags should be prominent — monospace text, bordered chips, grid layout.
- Numbers and metrics from the CV should be visually highlighted (large, bold, or colored).
- Subtle grid lines or structured dividers between sections. Clean, precise, engineer-friendly.`,

  creative: `TONE — CREATIVE:
- Heading font: a bold display face like Clash Display, Archivo Black, Cabinet Grotesk, or Syne.
- Body font: a readable sans like Inter or DM Sans.
- Bolder use of accent color — section backgrounds, large heading highlights, colored underlines.
- More visual personality: asymmetric layouts within sections, overlapping elements, editorial flair.
- Skill tags can be more colorful. Section headers can be larger and more dramatic.
- Interactions can be slightly more playful — scale on hover, color shifts, cursor effects.`,

  warm: `TONE — WARM:
- Heading font: a friendly rounded sans like DM Sans, Nunito, or Rubik.
- Body font: same family or paired with a soft serif like Lora.
- Rounded corners on everything (cards, badges, buttons) — 8px-12px radius.
- Soft shadows instead of hard borders (box-shadow with large blur, low opacity).
- Colors should feel inviting — slightly warm backgrounds (not pure white or pure black).
  In dark mode, use warm darks (#1A1816 not #000). In light mode, use warm whites (#FAF8F5 not #FFF).
- Generous padding, friendly spacing. The design should feel approachable and human.`,
}

// ─── Core design system (always included) ───────────────────
function buildDesignSystem(mode: string, accentColor: string): string {
  const dark = mode === 'dark'
  return `
MANDATORY DESIGN SYSTEM — follow this exactly:

CSS CUSTOM PROPERTIES (define in :root):
  /* Typography scale */
  --text-xs: 0.75rem;    /* 12px — labels, dates */
  --text-sm: 0.875rem;   /* 14px — secondary text */
  --text-base: 1rem;     /* 16px — body */
  --text-lg: 1.125rem;   /* 18px — emphasized body */
  --text-xl: 1.25rem;    /* 20px — section headers */
  --text-2xl: 1.5rem;    /* 24px — sub-headings */
  --text-3xl: 2rem;      /* 32px — page headings */
  --text-4xl: 2.75rem;   /* 44px — hero/name */

  /* Spacing scale — use these, not arbitrary values */
  --space-1: 0.25rem;  --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;     --space-6: 1.5rem;  --space-8: 2rem;
  --space-12: 3rem;    --space-16: 4rem;   --space-24: 6rem;

  /* Colors */
  --bg: ${dark ? '#0F0F0F' : '#FAFAF8'};
  --bg-raised: ${dark ? '#181818' : '#FFFFFF'};
  --bg-subtle: ${dark ? '#1E1E1E' : '#F5F3F0'};
  --text: ${dark ? '#E8E4DD' : '#1A1A1A'};
  --text-muted: ${dark ? '#999' : '#666'};
  --text-faint: ${dark ? '#555' : '#AAA'};
  --accent: ${accentColor};
  --accent-muted: ${accentColor}40;
  --border: ${dark ? '#2A2A2A' : '#E5E2DD'};
  --border-subtle: ${dark ? '#1E1E1E' : '#F0EDE8'};

MANDATORY RULES:
1. Output ONLY raw HTML. No markdown, no backticks, no explanation. Start with <!DOCTYPE html>.
2. All CSS in <style>, all JS in <script>. Single self-contained file.
3. Load exactly 2 Google Fonts via <link> — one for headings, one for body. NEVER use Inter, Roboto, or Arial from Google Fonts (system fallbacks are fine).
4. Use the CSS custom properties defined above for ALL colors, spacing, and font sizes. No hardcoded values.
5. All interactive elements (links, cards, badges) get: transition: all 0.2s ease;
6. Links: text-underline-offset: 3px; text-decoration-thickness: 1px;
7. Scroll-reveal: use IntersectionObserver to fade+slide sections in on scroll. Subtle — translateY(20px) to 0, opacity 0 to 1, 0.5s ease.
8. Skills/tools: render as styled tag badges in a flex-wrap grid. Monospace font, small, bordered.
9. Extract ALL information from the CV accurately. Do not invent or omit content.
10. Responsive: test at 1200px, 768px, and 375px widths mentally. Use @media queries.
11. Body line-height: 1.6-1.7 for readability. Headings: 1.1-1.2.
12. Sections should have generous vertical padding (var(--space-16) or more between major sections).
13. Add a subtle noise/grain texture overlay on the body for depth (use a CSS pseudo-element with a tiny repeating SVG or gradient pattern, very low opacity).
14. Use the accent color SPARINGLY — for links, active states, key highlights. Not for large areas.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cvBase64, cvMediaType,
      layout, layoutLabel,
      tone, toneLabel, toneDesc,
      mode, accentColor, accentLabel,
    } = body

    if (!cvBase64 || !layout || !tone || !mode || !accentColor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const layoutSpec = LAYOUT_SPECS[layout] || LAYOUT_SPECS.spotlight
    const toneSpec = TONE_SPECS[tone] || TONE_SPECS.refined
    const designSystem = buildDesignSystem(mode, accentColor)

    const system = `You are an elite frontend developer and visual designer who builds stunning personal webpages.
Your output quality matches the best hand-crafted developer portfolios — sites like brittanychiang.com, philipwalton.com, or stantyan.com.

You will receive a CV/resume document. Transform it into a beautiful, rich, single-file HTML personal webpage.

${designSystem}

${layoutSpec}

${toneSpec}

QUALITY BENCHMARKS — your output must feel like:
- A page someone spent weeks designing, not auto-generated
- Careful visual hierarchy: the eye knows exactly where to go
- Whitespace is intentional and generous, never cramped
- Typography creates rhythm — varied sizes, weights, and spacing guide the reader
- Colors are cohesive — accent is a thread that ties the design together
- Hover states feel precise and responsive, not showy
- The page looks complete and polished, not like a template

CONTENT EXTRACTION RULES:
- Extract every role, company, date, description, skill, education entry, and project
- If the CV contains URLs (LinkedIn, GitHub, portfolio), include them as proper links
- If no URLs exist, omit social links — do not invent them
- Bold key metrics and numbers naturally within descriptions
- Write a short 2-3 sentence bio synthesized from the CV's overall narrative (role + expertise + focus)

MODE: ${mode}
ACCENT: ${accentLabel} (${accentColor})`

    const userContent = cvMediaType === 'application/pdf'
      ? [
          {
            type: 'document' as const,
            source: {
              type: 'base64' as const,
              media_type: 'application/pdf' as const,
              data: cvBase64,
            },
          },
          {
            type: 'text' as const,
            text: `Build my personal webpage. Layout: ${layoutLabel}. Tone: ${toneLabel} (${toneDesc}). Mode: ${mode}. Accent: ${accentLabel} (${accentColor}).`,
          },
        ]
      : [
          {
            type: 'text' as const,
            text: `Here is my CV content:\n\n${Buffer.from(cvBase64, 'base64').toString('utf-8')}\n\nBuild my personal webpage. Layout: ${layoutLabel}. Tone: ${toneLabel} (${toneDesc}). Mode: ${mode}. Accent: ${accentLabel} (${accentColor}).`,
          },
        ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = response.content.find((b) => b.type === 'text')?.text ?? ''
    const html = raw.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '').trim()

    return NextResponse.json({ html })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('CV generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
