import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CV to Webpage',
  description: 'Turn your CV into a stunning personal webpage powered by Claude',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: '#0C0C0C' }}>
        {children}
      </body>
    </html>
  )
}
