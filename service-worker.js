const MAX_CONCURRENCY = 1000
const MAX_BYTES = 5 * 1024 * 1024
const PAGE_TIMEOUT = 5000
const ICON_TIMEOUT = 3500
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'])
const PROXY_STORAGE_KEY = 'iconProxy'
let proxyQueue = Promise.resolve()

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer); let result = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) result += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return btoa(result)
}

function generatedIcon(url, reason = 'icon not found') {
  const host = new URL(url).hostname.replace(/^www\./i, '')
  const text = (host.match(/[a-z0-9]/i)?.[0] || '?').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#2563eb"/><text x="32" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" fill="white">${text}</text></svg>`
  return { url, mimeType: 'image/svg+xml', data: toBase64(new TextEncoder().encode(svg)), source: 'generated', reason }
}

function iconLinks(html, pageUrl) {
  const links = []
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']*)["']/i)?.[1] || ''
    const href = tag.match(/\bhref\s*=\s*["']([^"']*)["']/i)?.[1] || ''
    if (!href || (!/(^|\s)(icon|shortcut|apple-touch-icon|mask-icon)(\s|$)/i.test(rel) && !/icon/i.test(rel))) continue
    try { links.push(new URL(href, pageUrl).href) } catch (_) {}
  }
  return links
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

async function fetchImage(url) {
  try {
    const response = await request(url, { headers: { accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' } })
    if (!response.ok) return null
    const length = Number(response.headers.get('content-length') || 0)
    if (length > MAX_BYTES) return null
    const bytes = await response.arrayBuffer()
    if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) return null
    const mimeType = imageType(bytes, response.headers.get('content-type'))
    return mimeType ? { mimeType, data: toBase64(bytes), source: 'site' } : null
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
  for (const origin of origins) for (const path of ['/favicon.ico', '/favicon.png', '/apple-touch-icon.png', '/favicon.svg']) candidates.push(origin + path)
  return [...new Set(candidates)]
}

async function fetchOne(url, { publicFallback = true } = {}) {
  try {
    const page = new URL(url)
    if (!['http:', 'https:'].includes(page.protocol)) return { url, error: 'unsupported scheme' }
    for (const candidate of await candidatesFor(url)) {
      const icon = await fetchImage(candidate)
      if (icon) return { url, ...icon }
    }
    if (publicFallback) {
      const publicCandidates = [
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(page.hostname)}&sz=64`,
        `https://icons.duckduckgo.com/ip3/${encodeURIComponent(page.hostname)}.ico`,
        `https://favicon.im/${encodeURIComponent(page.hostname)}`,
        `https://api.faviconkit.com/${encodeURIComponent(page.hostname)}/128`,
      ]
      for (const fallback of publicCandidates) {
        const icon = await fetchImage(fallback)
        if (icon) return { url, ...icon, source: 'public' }
      }
    }
    return { url, error: 'icon not found' }
  } catch (_) { return { url, error: 'fetch failed' } }
}

function proxyCall(method, details) {
  return new Promise((resolve, reject) => chrome.proxy.settings[method](details, value => {
    const error = chrome.runtime.lastError
    if (error) reject(new Error(error.message)); else resolve(value)
  }))
}

function validProxy(value) {
  return value && ['http', 'https', 'socks4', 'socks5'].includes(value.scheme) && typeof value.host === 'string' && value.host.trim() && Number.isInteger(Number(value.port)) && Number(value.port) >= 1 && Number(value.port) <= 65535
}

async function retryWithProxy(urls, config) {
  if (!validProxy(config) || !urls.length) return []
  let release; const previous = proxyQueue; proxyQueue = new Promise(resolve => { release = resolve }); await previous
  let original
  try {
    original = await proxyCall('get', { incognito: false })
    const value = { mode: 'fixed_servers', rules: { singleProxy: { scheme: config.scheme, host: config.host.trim(), port: Number(config.port) } } }
    await proxyCall('set', { value, scope: 'regular' })
    // Keep the public favicon fallback enabled during proxy retries as well.
    const results = await Promise.all(urls.map(url => fetchOne(url, { publicFallback: true })))
    await proxyCall('set', { value: original.value || { mode: 'system' }, scope: 'regular' })
    return results
  } catch (_) {
    if (original) { try { await proxyCall('set', { value: original.value || { mode: 'system' }, scope: 'regular' }) } catch (_) {} }
    return []
  } finally { release() }
}

async function fetchAll(urls) {
  const items = new Array(urls.length); let next = 0
  const proxyValues = await chrome.storage.sync.get({ [PROXY_STORAGE_KEY]: null }).catch(() => ({ [PROXY_STORAGE_KEY]: null }))
  const worker = async () => { while (next < urls.length) { const index = next++; items[index] = await fetchOne(urls[index]) } }
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, urls.length) }, worker))
  const failedIndexes = items.map((item, index) => item.error ? index : -1).filter(index => index >= 0)
    const proxyResults = await retryWithProxy(failedIndexes.map(index => urls[index]), proxyValues[PROXY_STORAGE_KEY])
  proxyResults.forEach((item, index) => { if (!item.error) items[failedIndexes[index]] = item })
  items.forEach((item, index) => { if (item.error) items[index] = generatedIcon(urls[index], item.error) })
  return items
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'ping') { sendResponse({ requestId: message.requestId }); return false }
  if (message?.type !== 'fetch-icons' || !Array.isArray(message.urls) || message.urls.length > 2000) return false
  fetchAll(message.urls).then(items => sendResponse({ requestId: message.requestId, items })).catch(() => sendResponse({ requestId: message.requestId, items: [] }))
  return true
})
