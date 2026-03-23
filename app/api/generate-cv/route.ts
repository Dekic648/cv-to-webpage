import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Pass 1: CV extraction prompt ───────────────────────────
const EXTRACTION_SYSTEM = `You are a meticulous CV parser. Extract EVERY piece of information from the provided CV/resume into structured JSON.

You MUST return valid JSON only. No markdown, no backticks, no explanation.

Required JSON structure:
{
  "name": "Full Name",
  "title": "Current/Most Recent Job Title",
  "bio": "2-3 sentence professional summary synthesized from the CV",
  "contact": {
    "email": "if present or null",
    "phone": "if present or null",
    "location": "city/country if present or null",
    "linkedin": "URL if present or null",
    "github": "URL if present or null",
    "website": "URL if present or null",
    "other_links": [{"label": "name", "url": "URL"}]
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "if present or null",
      "start_date": "e.g. Jan 2020",
      "end_date": "e.g. Present",
      "description": "Full description with ALL bullet points merged into flowing text. Include every metric, number, and achievement mentioned.",
      "highlights": ["key achievement 1 with numbers", "key achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "graduation year or date range",
      "details": "honors, GPA, relevant coursework if mentioned"
    }
  ],
  "skills": {
    "categories": [
      {"name": "Category name if CV groups skills, otherwise use 'Skills'", "items": ["skill1", "skill2"]}
    ]
  },
  "certifications": [{"name": "cert name", "issuer": "if present", "year": "if present"}],
  "languages": [{"language": "name", "level": "proficiency if stated"}],
  "projects": [{"name": "project name", "description": "details", "tech": ["if mentioned"], "url": "if present or null"}],
  "awards": [{"name": "award", "details": "context"}],
  "publications": [{"title": "name", "details": "context"}],
  "volunteer": [{"role": "role", "org": "organization", "details": "context"}],
  "other_sections": [{"title": "Section Name", "content": "raw text content of any section not covered above"}]
}

CRITICAL RULES:
- Include EVERY role, EVERY bullet point, EVERY skill, EVERY education entry. Omitting content is a failure.
- If a field has no data, use null for single values or [] for arrays. Keep the key.
- Preserve exact numbers, percentages, currency amounts, team sizes — these are the most important details.
- For experience descriptions: merge all bullet points into a rich paragraph but keep every detail. Also extract the top 2-3 highlights separately.
- If the CV has sections not covered by the schema (e.g. "Interests", "References", "Summary"), put them in other_sections.
- Return ONLY the JSON object. Nothing else.`

// ─── Layout specifications ──────────────────────────────────
const LAYOUT_SPECS: Record<string, string> = {
  spotlight: `LAYOUT — SPOTLIGHT (two-column, fixed sidebar):
- Left sidebar: fixed position, width ~300px, full viewport height.
  Contains: name (large, prominent), title/role below, bio paragraph,
  vertical navigation links for each section that exists in the data,
  social/contact links at the bottom.
- Right content area: scrollable, with left margin clearing the sidebar, generous padding.
  ALL content sections flow here vertically. Every section of data MUST appear here.
- Navigation in sidebar MUST highlight the active section on scroll using IntersectionObserver.
- The sidebar should have a slightly different background shade for depth.
- On mobile (<768px): sidebar becomes a compact top header, content goes full-width.`,

  editorial: `LAYOUT — EDITORIAL (centered single column):
- Single centered column, max-width: 720px, with generous auto margins.
- Top area: name and title, elegant and minimal. No sidebar, no sticky nav.
- ALL sections flow vertically with generous spacing (min 4rem between major sections).
- Use subtle section dividers (thin lines, extra whitespace, or small ornamental elements).
- Typography does the heavy lifting. Use size, weight, and spacing for hierarchy.
- On mobile: maintain centered layout, reduce horizontal padding.`,

  showcase: `LAYOUT — SHOWCASE (full-width hero + card sections):
- Hero section: full viewport width and at least 60vh tall, vertically centered name/title/tagline.
  Hero should have a subtle gradient, pattern, or texture background for depth.
- Below hero: ALL content sections with alternating subtle background shifts.
- Experience and projects displayed as card grids (2-3 columns on desktop).
  Cards have borders or shadows, hover effects (lift + shadow increase), consistent sizing.
- Sticky top navigation bar with section links, semi-transparent background with backdrop-blur.
- On mobile: single column cards, hero scales down, nav stays sticky.`,
}

// ─── Tone specifications ────────────────────────────────────
const TONE_SPECS: Record<string, string> = {
  refined: `TONE — REFINED:
- Heading font: elegant serif (Playfair Display, Cormorant Garamond, or Libre Baskerville).
- Body font: clean sans-serif (Source Sans 3, Work Sans, or Karla).
- Extra whitespace everywhere. Accent used sparingly — links and small highlights only.
- Thin borders (0.5px-1px), letter-spacing on uppercase labels, gentle opacity transitions.
- Transitions: 0.2-0.3s ease. Understated elegance.`,

  technical: `TONE — TECHNICAL:
- Heading font: geometric sans (Space Grotesk, Outfit, or Syne).
- Code/label font: monospace (JetBrains Mono or Space Mono) for dates, labels, tags.
- Structured and systematic. Consistent grid alignment. Data feels organized.
- Skill badges prominent — monospace text, bordered chips, grid layout.
- Numbers and metrics visually highlighted (large, bold, or colored).`,

  creative: `TONE — CREATIVE:
- Heading font: bold display face (Archivo Black, Cabinet Grotesk, or Syne).
- Body font: readable sans (DM Sans or Plus Jakarta Sans).
- Bolder accent color usage — section backgrounds, heading highlights, colored underlines.
- Visual personality: asymmetric layouts, editorial flair within sections.
- Interactions slightly more playful — scale on hover, color shifts.`,

  warm: `TONE — WARM:
- Heading font: friendly rounded sans (DM Sans, Nunito, or Rubik).
- Body font: same family or paired with soft serif (Lora).
- Rounded corners on everything (8px-12px radius).
- Soft shadows instead of hard borders (box-shadow with large blur, low opacity).
- Warm backgrounds (#1A1816 dark, #FAF8F5 light). Approachable and human.`,
}

// ─── Core design system ─────────────────────────────────────
function buildDesignSystem(mode: string, accentColor: string): string {
  const dark = mode === 'dark'
  return `
MANDATORY DESIGN SYSTEM:

CSS CUSTOM PROPERTIES (define in :root):
  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.125rem;
  --text-xl: 1.25rem; --text-2xl: 1.5rem; --text-3xl: 2rem; --text-4xl: 2.75rem;
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem; --space-24: 6rem;
  --bg: ${dark ? '#0F0F0F' : '#FAFAF8'};
  --bg-raised: ${dark ? '#181818' : '#FFFFFF'};
  --bg-subtle: ${dark ? '#1E1E1E' : '#F5F3F0'};
  --text: ${dark ? '#E8E4DD' : '#1A1A1A'};
  --text-muted: ${dark ? '#999' : '#666'};
  --text-faint: ${dark ? '#555' : '#AAA'};
  --accent: ${accentColor};
  --accent-muted: ${accentColor}40;
  --border: ${dark ? '#2A2A2A' : '#E5E2DD'};

RULES:
1. Output ONLY raw HTML. No markdown, no backticks. Start with <!DOCTYPE html>.
2. All CSS in <style>, all JS in <script>. Single self-contained file.
3. Load exactly 2 Google Fonts via <link> — one for headings, one for body.
4. Use CSS custom properties for ALL colors, spacing, font sizes.
5. All interactive elements: transition: all 0.2s ease;
6. Links: text-underline-offset: 3px; text-decoration-thickness: 1px;
7. Scroll-reveal with IntersectionObserver: translateY(20px)->0, opacity 0->1, 0.5s ease.
8. Skills as styled tag badges in flex-wrap grid.
9. Responsive with @media queries for 1200px, 768px, 375px.
10. Body line-height: 1.6-1.7. Headings: 1.1-1.2.
11. Generous section padding (var(--space-16)+).
12. Accent color used SPARINGLY — links, active states, key highlights only.`
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

    // ── PASS 1: Extract all CV content ──────────────────────
    const extractionContent = cvMediaType === 'application/pdf'
      ? [
          {
            type: 'document' as const,
            source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: cvBase64 },
          },
          { type: 'text' as const, text: 'Extract all content from this CV into the JSON structure specified. Include every single detail.' },
        ]
      : [
          {
            type: 'text' as const,
            text: `Extract all content from this CV into the JSON structure specified. Include every single detail.\n\nCV CONTENT:\n${Buffer.from(cvBase64, 'base64').toString('utf-8')}`,
          },
        ]

    const extractionResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: EXTRACTION_SYSTEM,
      messages: [{ role: 'user', content: extractionContent }],
    })

    const extractedRaw = extractionResponse.content.find((b) => b.type === 'text')?.text ?? '{}'
    // Clean potential markdown wrapping
    const extractedJson = extractedRaw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()

    // Validate it's parseable JSON
    let cvData
    try {
      cvData = JSON.parse(extractedJson)
    } catch {
      return NextResponse.json({ error: 'Failed to parse CV content. Please try again or use a different file format.' }, { status: 500 })
    }

    // ── PASS 2: Build the webpage ───────────────────────────
    const layoutSpec = LAYOUT_SPECS[layout] || LAYOUT_SPECS.spotlight
    const toneSpec = TONE_SPECS[tone] || TONE_SPECS.refined
    const designSystem = buildDesignSystem(mode, accentColor)

    const buildSystem = `You are an elite frontend developer and visual designer.
Your output quality matches hand-crafted portfolios like brittanychiang.com or philipwalton.com.

You will receive structured JSON data extracted from a CV. Build a stunning single-file HTML personal webpage using ALL of the provided data.

${designSystem}

${layoutSpec}

${toneSpec}

CRITICAL — CONTENT COMPLETENESS:
- You MUST render EVERY experience entry from the JSON. Every single one with full descriptions.
- You MUST render EVERY education entry, EVERY skill, EVERY certification, EVERY project.
- If a section has data (non-null, non-empty array), it MUST appear on the page.
- Sections with no data (null or empty arrays) should be omitted entirely.
- Experience highlights should be visually distinct (bold, colored, or separated).
- The bio goes in the header/sidebar area. All other sections go in the main content area.
- For experience: show role, company, dates, full description text, and highlights.

This is the #1 priority: ALL content must be visible on the page. Design is secondary to completeness.

MODE: ${mode}
ACCENT: ${accentLabel} (${accentColor})`

    const buildResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 24000,
      system: buildSystem,
      messages: [{
        role: 'user',
        content: `Here is the complete CV data as JSON. Build the HTML webpage using ALL of this data. Do not skip any section or entry.\n\n${JSON.stringify(cvData, null, 2)}\n\nLayout: ${layoutLabel}. Tone: ${toneLabel} (${toneDesc}). Mode: ${mode}. Accent: ${accentLabel} (${accentColor}).`,
      }],
    })

    const raw = buildResponse.content.find((b) => b.type === 'text')?.text ?? ''
    const html = raw.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '').trim()

    if (!html.toLowerCase().includes('<html')) {
      return NextResponse.json({ error: 'Generation produced unexpected output. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ html })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('CV generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
