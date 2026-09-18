const input = document.querySelector('#new-tab-url')
const enabled = document.querySelector('#new-tab-enabled')
const status = document.querySelector('#status')

enabled.checked = DEFAULT_NEW_TAB_ENABLED

function setStatus(message, error = false) {
  status.textContent = message
  status.classList.toggle('error', error)
}

async function readUrl() {
  try {
    const values = await chrome.storage.sync.get({
      [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL,
      [NEW_TAB_ENABLED_STORAGE_KEY]: DEFAULT_NEW_TAB_ENABLED
    })
    enabled.checked = values[NEW_TAB_ENABLED_STORAGE_KEY] === true
    return normalizeNewTabUrl(values[NEW_TAB_STORAGE_KEY]) || DEFAULT_NEW_TAB_URL
  } catch (_) {
    enabled.checked = DEFAULT_NEW_TAB_ENABLED
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
    await chrome.storage.sync.set({
      [NEW_TAB_STORAGE_KEY]: url,
      [NEW_TAB_ENABLED_STORAGE_KEY]: enabled.checked
    })
    input.value = url
    setStatus('已保存。')
  } catch (_) {
    setStatus('保存失败，请稍后重试。', true)
  }
}

async function resetUrl() {
  try {
    await chrome.storage.sync.set({
      [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL,
      [NEW_TAB_ENABLED_STORAGE_KEY]: DEFAULT_NEW_TAB_ENABLED
    })
    input.value = DEFAULT_NEW_TAB_URL
    enabled.checked = DEFAULT_NEW_TAB_ENABLED
    setStatus('已恢复默认设置。')
  } catch (_) {
    setStatus('保存失败，请稍后重试。', true)
  }
}

document.querySelector('#save').addEventListener('click', saveUrl)
document.querySelector('#reset').addEventListener('click', resetUrl)
input.addEventListener('keydown', event => { if (event.key === 'Enter') saveUrl() })

readUrl().then(url => { input.value = url })
