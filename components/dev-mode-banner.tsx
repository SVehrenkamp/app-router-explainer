// Dev-vs-prod honesty: the Full Route Cache is disabled under `next dev` and the
// client Router Cache behaves differently. A server component reading NODE_ENV —
// the check runs on the server and ships no JS.
export function DevModeBanner() {
  if (process.env.NODE_ENV === 'production') return null
  return (
    <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
      Dev mode: some caching demos behave differently here. For true caching semantics run{' '}
      <code>npm run build &amp;&amp; npm start</code>.
    </p>
  )
}
