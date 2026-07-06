'use server'

// The invalidation half of the Cache Lab. Server Actions so the lab UI can
// trigger revalidation exactly the way product code would.
import { revalidatePath, revalidateTag } from 'next/cache'

export async function revalidateLabTag(): Promise<{ revalidated: 'tag'; at: string }> {
  revalidateTag('lab-tagged')
  return { revalidated: 'tag', at: new Date().toISOString() }
}

export async function revalidateLabPath(): Promise<{ revalidated: 'path'; at: string }> {
  revalidatePath('/api/labs/cache/revalidate')
  return { revalidated: 'path', at: new Date().toISOString() }
}
