// A search form with ZERO client JavaScript. A plain GET form submits to the
// same route; the server re-renders with the new searchParams. Progressive
// enhancement isn't extra work in the App Router — it's the default.
export function SearchBox({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/store/search" className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search products…"
        className="w-64 rounded-lg border border-zinc-300 px-3 py-2"
      />
      <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-white">
        Search
      </button>
    </form>
  )
}
