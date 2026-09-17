const input = document.querySelector('#new-tab-url')
const status = document.querySelector('#status')
const proxyUrl = document.querySelector('#proxy-url')
const PROXY_STORAGE_KEY = 'iconProxy'

function setStatus(message, error = false) {
  status.textContent = message
  status.classList.toggle('error', error)
}

async function readUrl() {
  try {
    const values = await chrome.storage.sync.get({ [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL })
    return normalizeNewTabUrl(values[NEW_TAB_STORAGE_KEY]) || DEFAULT_NEW_TAB_URL
  } catch (_) {
    return DEFAULT_NEW_TAB_URL
  }
}

async function saveUrl() {
  const url = normalizeNewTabUrl(input.value)
  if (!url) {
    input.value = DEFAULT_NEW_TAB_URL
    setStatus('请输入有效的 http 或 https 地址。', true)
    return
  }
  try {
    await chrome.storage.sync.set({ [NEW_TAB_STORAGE_KEY]: url })
    input.value = url
    setStatus('已保存。')
  } catch (_) {
    setStatus('保存失败，请稍后重试。', true)
  }
}

async function resetUrl() {
  try {
    await chrome.storage.sync.set({ [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL })
    input.value = DEFAULT_NEW_TAB_URL
    setStatus('已恢复默认地址。')
  } catch (_) {
    setStatus('保存失败，请稍后重试。', true)
  }
}

function readProxy() {
  const value = proxyUrl.value.trim()
  try {
    const parsed = new URL(value)
    const scheme = parsed.protocol.slice(0, -1)
    const port = Number(parsed.port)
    if (!['http', 'https', 'socks4', 'socks5'].includes(scheme) || parsed.username || parsed.password || !parsed.hostname || !Number.isInteger(port) || port < 1 || port > 65535 || parsed.pathname !== '/' || parsed.search || parsed.hash) return null
    return { scheme, host: parsed.hostname, port }
  } catch (_) { return null }
}

async function saveProxy() {
  const proxy = readProxy()
  if (!proxy) { setStatus('请输入有效的代理地址，例如 http://192.168.31.10:7890。', true); return }
  try {
    await chrome.storage.sync.set({ [PROXY_STORAGE_KEY]: proxy })
    setStatus('代理配置已保存。')
  } catch (_) { setStatus('代理配置保存失败，请稍后重试。', true) }
}

async function clearProxy() {
  try {
    await chrome.storage.sync.remove(PROXY_STORAGE_KEY)
    proxyUrl.value = ''; setStatus('代理配置已清除。')
  } catch (_) { setStatus('代理配置清除失败，请稍后重试。', true) }
}

document.querySelector('#save').addEventListener('click', saveUrl)
document.querySelector('#reset').addEventListener('click', resetUrl)
input.addEventListener('keydown', event => { if (event.key === 'Enter') saveUrl() })
document.querySelector('#save-proxy').addEventListener('click', saveProxy)
document.querySelector('#clear-proxy').addEventListener('click', clearProxy)

readUrl().then(url => { input.value = url })
chrome.storage.sync.get({ [PROXY_STORAGE_KEY]: null }).then(values => {
  const proxy = values[PROXY_STORAGE_KEY]
  if (proxy) proxyUrl.value = `${proxy.scheme || 'http'}://${proxy.host || ''}:${proxy.port || ''}`
}).catch(() => {})
