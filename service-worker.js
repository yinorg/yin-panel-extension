const MAX_CONCURRENCY = 1000
const MAX_BYTES = 5 * 1024 * 1024
const PAGE_TIMEOUT = 5000
const ICON_TIMEOUT = 3500
const PUBLIC_MAX_CONCURRENCY = 8
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'])

const PUBLIC_FAVICON_SERVICES = [
  hostname => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`,
  hostname => `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`,
  hostname => `https://favicon.im/${encodeURIComponent(hostname)}`,
  hostname => `https://api.faviconkit.com/${encodeURIComponent(hostname)}/128`,
  hostname => `https://favicon.cccyun.cc/favicon.ico?url=${encodeURIComponent(hostname)}`,
  hostname => `https://icon.horse/icon/${encodeURIComponent(hostname)}`,
]

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer); let result = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) result += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return btoa(result)
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:["']([^"']*)["']|([^\\s>]+))`, 'i'))?.slice(1).find(Boolean) || ''
}

function iconLinks(html, pageUrl) {
  const links = []
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = attribute(tag, 'rel').toLowerCase().split(/\s+/).filter(Boolean)
    const href = attribute(tag, 'href')
    const type = attribute(tag, 'type').toLowerCase().split(';')[0]
    const sizes = attribute(tag, 'sizes').toLowerCase()
    const kind = rel.includes('icon') ? 'icon' : rel.includes('shortcut') && rel.includes('icon') ? 'icon' : rel.includes('apple-touch-icon') ? 'apple' : rel.includes('mask-icon') ? 'mask' : ''
    if (!href || !kind || (type && !IMAGE_TYPES.has(type))) continue
    const size = sizes.match(/(?:^|\s)(\d+)x(\d+)(?:\s|$)/)
    const score = kind === 'icon' ? 0 : kind === 'apple' ? 1 : 2
    const sizeScore = size ? Math.abs(Math.max(Number(size[1]), Number(size[2])) - 64) : 1000
    try { links.push({ url: new URL(href, pageUrl).href, score, sizeScore }) } catch (_) {}
  }
  return links.sort((a, b) => a.score - b.score || a.sizeScore - b.sizeScore).map(item => item.url)
}

function imageType(bytes, contentType) {
  const type = (contentType || '').split(';')[0].toLowerCase()
  if (IMAGE_TYPES.has(type)) return type
  const b = new Uint8Array(bytes)
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return 'image/webp'
  const text = new TextDecoder().decode(b.slice(0, 256)).trimStart()
  if (text.startsWith('<svg') || text.startsWith('<?xml')) return 'image/svg+xml'
  if (b.length > 4 && b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'image/x-icon'
  return null
}

async function request(url, options = {}, timeout = ICON_TIMEOUT) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout)
  try { return await fetch(url, { ...options, redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0 Chrome/131 Safari/537.36', ...(options.headers || {}) } }) }
  finally { clearTimeout(timer) }
}

async function fetchImage(url, source = 'site') {
  try {
    const response = await request(url, { headers: { accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' } })
    if (!response.ok) return null
    const length = Number(response.headers.get('content-length') || 0)
    if (length > MAX_BYTES) return null
    const bytes = await response.arrayBuffer()
    if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) return null
    const mimeType = imageType(bytes, response.headers.get('content-type'))
    return mimeType ? { mimeType, data: toBase64(bytes), source } : null
  } catch (_) { return null }
}

async function candidatesFor(url) {
  const page = new URL(url); const candidates = []; let pageUrl = page.href
  try {
    const response = await request(page.href, {}, PAGE_TIMEOUT)
    pageUrl = response.url || page.href
    if (response.ok) candidates.push(...iconLinks(await response.text(), pageUrl))
  } catch (_) {}
  const origins = []
  for (const candidate of [page.href, pageUrl]) {
    try { const origin = new URL(candidate).origin; if (!origins.includes(origin)) origins.push(origin) } catch (_) {}
  }
  for (const origin of origins) for (const path of ['/favicon.ico', '/favicon.png', '/favicon.svg', '/apple-touch-icon.png']) candidates.push(origin + path)
  return [...new Set(candidates)]
}

async function fetchSiteIcon(url) {
  try {
    const page = new URL(url)
    if (!['http:', 'https:'].includes(page.protocol)) return { url, error: 'unsupported scheme' }
    for (const candidate of await candidatesFor(url)) {
      const icon = await fetchImage(candidate)
      if (icon) return { url, ...icon }
    }
    return { url, error: 'icon not found' }
  } catch (_) { return { url, error: 'fetch failed' } }
}

async function probePublicServices() {
  const probeHostname = 'github.com'
  const probes = await Promise.all(PUBLIC_FAVICON_SERVICES.map(async (build, index) => {
    const started = performance.now()
    const icon = await fetchImage(build(probeHostname), 'public')
    return icon ? { index, icon, elapsed: performance.now() - started } : null
  }))
  return probes.filter(Boolean).sort((a, b) => a.elapsed - b.elapsed)
}

async function fetchPublicIcon(url, service) {
  let hostname
  try { hostname = new URL(url).hostname } catch (_) { return { url, error: 'fetch failed' } }
  const icon = await fetchImage(PUBLIC_FAVICON_SERVICES[service.index](hostname), 'public')
  return icon ? { url, ...icon } : { url, error: 'icon not found' }
}

async function fetchPublicIcons(urls, services) {
  if (!urls.length || !services.length) return urls.map(url => ({ url, error: 'icon not found' }))

  // Each available service owns eight workers. Workers pull from one shared
  // queue so a slow service cannot leave its slots permanently unused.
  const results = new Array(urls.length); let next = 0
  const workers = services.flatMap(service => Array.from({ length: PUBLIC_MAX_CONCURRENCY }, async () => {
    while (true) {
      const index = next++
      if (index >= urls.length) return
      results[index] = await fetchPublicIcon(urls[index], service)
    }
  }))
  await Promise.all(workers)
  return results
}

async function fetchAll(urls) {
  const items = new Array(urls.length); let next = 0
  const worker = async () => { while (next < urls.length) { const index = next++; items[index] = await fetchSiteIcon(urls[index]) } }
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, urls.length) }, worker))
  const failedIndexes = items.map((item, index) => item.error ? index : -1).filter(index => index >= 0)
  const hasHttpFailure = failedIndexes.some(index => {
    try { return /^https?:$/i.test(new URL(urls[index]).protocol) } catch (_) { return false }
  })
  const availablePublicServices = hasHttpFailure ? await probePublicServices() : []
  const publicResults = availablePublicServices.length
    ? await fetchPublicIcons(failedIndexes.map(index => urls[index]), availablePublicServices)
    : failedIndexes.map(index => items[index])
  publicResults.forEach((item, index) => { items[failedIndexes[index]] = item })
  return items
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'ping') { sendResponse({ requestId: message.requestId }); return false }
  if (message?.type !== 'fetch-icons' || !Array.isArray(message.urls) || message.urls.length > 2000) return false
  fetchAll(message.urls).then(items => sendResponse({ requestId: message.requestId, items })).catch(() => sendResponse({ requestId: message.requestId, items: [] }))
  return true
})
