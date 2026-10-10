localizeDocument()

const input = document.querySelector('#new-tab-url')
const status = document.querySelector('#status')

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
    setStatus(t('statusInvalidUrl'), true)
    return
  }
  try {
    await chrome.storage.sync.set({ [NEW_TAB_STORAGE_KEY]: url })
    input.value = url
    setStatus(t('statusSaved'))
  } catch (_) {
    setStatus(t('statusSaveFailed'), true)
  }
}

async function resetUrl() {
  try {
    await chrome.storage.sync.set({ [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL })
    input.value = DEFAULT_NEW_TAB_URL
    setStatus(t('statusResetDone'))
  } catch (_) {
    setStatus(t('statusSaveFailed'), true)
  }
}

document.querySelector('#save').addEventListener('click', saveUrl)
document.querySelector('#reset').addEventListener('click', resetUrl)
input.addEventListener('keydown', event => { if (event.key === 'Enter') saveUrl() })

readUrl().then(url => { input.value = url })
