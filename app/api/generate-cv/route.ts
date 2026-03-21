import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cvBase64, cvMediaType, vibe, vibeDesc, emphasis, accentColor } = body

    if (!cvBase64 || !vibe || !emphasis || !accentColor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const system = `You are an elite frontend developer and visual designer. Transform a CV into a stunning single-file HTML page.

DESIGN:
- Vibe: ${vibe} — ${vibeDesc}
- Emphasis: ${emphasis}
- Accent: ${accentColor}

RULES:
1. Output ONLY raw HTML. No markdown, no backticks. Start with <!DOCTYPE html>.
2. All CSS in <style>, all JS in <script>. Single file.
3. Use Google Fonts — 2 distinctive fonts matching the vibe. NEVER Inter, Roboto, Arial.
4. CSS variables throughout. Primary accent = ${accentColor}.
5. Scroll-reveal animations + hover effects.
6. Skills/tools: visually bold — styled tag badges in a grid.
7. Bold all key numbers and metrics from the CV.
8. Mobile responsive.
9. Noise texture overlay for depth.
10. Extract ALL CV info accurately. Do not invent content.`

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
            text: `Build the HTML CV page. Vibe: ${vibe}. Emphasis: ${emphasis}. Accent: ${accentColor}.`,
          },
        ]
      : [
          {
            type: 'text' as const,
            text: `Here is the CV content:\n\n${Buffer.from(cvBase64, 'base64').toString('utf-8')}\n\nBuild the HTML CV page. Vibe: ${vibe}. Emphasis: ${emphasis}. Accent: ${accentColor}.`,
          },
        ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
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
