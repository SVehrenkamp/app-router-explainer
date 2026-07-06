import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Defaults only: no incremental-cache binding, so ISR/`revalidate` hints are
// per-isolate best-effort. Fine for a demo serving fixture data; add the R2
// incremental cache override here if persistent revalidation ever matters.
export default defineCloudflareConfig({})
