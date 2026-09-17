window.addEventListener('message', event => {
  const data = event.data
  if (event.source !== window || data?.source !== 'yin-panel') return
  if (data.type === 'ping') {
    window.postMessage({ source: 'yin-panel-extension', type: 'pong', requestId: data.requestId }, '*')
    return
  }
  if (data.type !== 'fetch-icons' || !Array.isArray(data.urls)) return
  try {
    chrome.runtime.sendMessage({ type: 'fetch-icons', requestId: data.requestId, urls: data.urls }).then(result => {
      window.postMessage({ source: 'yin-panel-extension', ...result }, '*')
    }).catch(() => window.postMessage({ source: 'yin-panel-extension', requestId: data.requestId, items: [] }, '*'))
  } catch (_) {
    window.postMessage({ source: 'yin-panel-extension', requestId: data.requestId, items: [] }, '*')
  }
})
