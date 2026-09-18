const target = document.querySelector('#target')

chrome.storage.sync.get({
  [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL,
  [NEW_TAB_ENABLED_STORAGE_KEY]: DEFAULT_NEW_TAB_ENABLED
}).then(values => {
  const url = normalizeNewTabUrl(values[NEW_TAB_STORAGE_KEY]) || DEFAULT_NEW_TAB_URL
  target.href = url
  if (values[NEW_TAB_ENABLED_STORAGE_KEY] === true) location.replace(url)
}).catch(() => location.replace(DEFAULT_NEW_TAB_URL))
