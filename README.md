# CV to Webpage

Turn any CV/resume into a stunning single-page HTML webpage — powered by Claude AI.

**Live app:** https://cv-to-webpage.vercel.app/

## How It Works

1. Upload your CV (PDF, TXT, or DOCX)
2. Pick a visual style:
   - **Vibe** — Bold & Creative, Clean & Minimal, Dark & Moody, Sharp & Corporate, Retro Futuristic, or Soft & Editorial
   - **Emphasis** — Skills & Tools, Work Experience, Projects & Portfolio, or Balanced Overview
   - **Accent color** — Flame, Teal, Gold, Violet, Rose, or Sky
3. Click "Generate My Personal Webpage"
4. Claude AI builds a complete, self-contained HTML page with custom typography, animations, and responsive layout
5. Preview it in the browser and download as a standalone `.html` file

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **AI:** Claude Sonnet via `@anthropic-ai/sdk`
- **Styling:** Inline React styles (dark theme)
- **Deployment:** Vercel

## Local Development

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000

## Cost

~$0.07 per webpage generated using Claude Sonnet.
