# CV Visualizer

Turn any CV/resume into a stunning single-page HTML profile — powered by Claude.

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

Open http://localhost:3000 — you're live.

---

## Project Structure

```
cv-visualizer/
├── app/
│   ├── api/
│   │   └── generate-cv/
│   │       └── route.ts        ← Anthropic API proxy (key stays server-side)
│   ├── components/
│   │   └── CvVisualizer.tsx    ← Main UI component
│   ├── layout.tsx
│   └── page.tsx
├── .env.local.example          ← Copy to .env.local and add your key
├── .env.local                  ← Your real key (git-ignored)
└── README.md
```

## How It Works

1. User uploads a PDF or text CV
2. Picks a visual style (vibe, emphasis, accent color)
3. Frontend sends the CV + prefs to `/api/generate-cv`
4. Next.js API route calls Anthropic with your server-side key
5. Claude generates a complete single-file HTML page
6. Rendered in an iframe — user can download it

## Cost

~$0.07 per CV generated using Claude Sonnet.

## Next Steps / Ideas

- [ ] Add user auth (Supabase)
- [ ] Save generated CVs to storage (Cloudflare R2)
- [ ] Add more style options
- [ ] Preview in mobile/desktop toggle
- [ ] Share via public URL
- [ ] Stripe payments (~$5/CV)
