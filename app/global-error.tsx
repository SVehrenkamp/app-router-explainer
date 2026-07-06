'use client'

// Catches errors thrown by the ROOT layout itself. Because it replaces the
// entire document it must render its own <html> and <body>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', padding: '4rem', textAlign: 'center' }}>
        <h1>Something went badly wrong</h1>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
