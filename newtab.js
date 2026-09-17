const target = document.querySelector('#target')

chrome.storage.sync.get({ [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL }).then(values => {
  const url = normalizeNewTabUrl(values[NEW_TAB_STORAGE_KEY]) || DEFAULT_NEW_TAB_URL
  target.href = url
  location.replace(url)
}).catch(() => location.replace(DEFAULT_NEW_TAB_URL))
