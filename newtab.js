chrome.storage.sync.get({ [NEW_TAB_STORAGE_KEY]: DEFAULT_NEW_TAB_URL }).then(values => {
  const url = normalizeNewTabUrl(values[NEW_TAB_STORAGE_KEY]) || DEFAULT_NEW_TAB_URL
  location.replace(url)
}).catch(() => location.replace(DEFAULT_NEW_TAB_URL))
