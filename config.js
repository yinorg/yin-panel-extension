const DEFAULT_NEW_TAB_URL = 'https://panel.yiniot.com'
const NEW_TAB_STORAGE_KEY = 'newTabUrl'
const NEW_TAB_ENABLED_STORAGE_KEY = 'newTabEnabled'
const DEFAULT_NEW_TAB_ENABLED = true

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
