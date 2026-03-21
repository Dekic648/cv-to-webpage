# CV to Webpage

Turn any CV/resume into a stunning single-page HTML webpage — powered by Claude AI.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
```bash
cp .env.local.example .env.local
```
Open `.env.local` and replace the placeholder with your real key.
Get one at: https://console.anthropic.com

### 3. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## How It Works

1. Upload a PDF or text CV
2. Pick a visual style (vibe, emphasis, accent color)
3. Click "Generate My Personal Webpage"
4. Claude AI generates a complete single-file HTML page
5. Preview it in the browser and download as a standalone `.html` file

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **AI:** Claude Sonnet via `@anthropic-ai/sdk`
- **Styling:** Inline React styles (dark theme)

## Cost

~$0.07 per webpage generated using Claude Sonnet.
