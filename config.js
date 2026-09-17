const DEFAULT_NEW_TAB_URL = 'http://panel.yiniot.com'
const NEW_TAB_STORAGE_KEY = 'newTabUrl'

function normalizeNewTabUrl(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return null
  try {
    const url = new URL(text)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch (_) {
    return null
  }
}
