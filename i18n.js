// Shared message lookup and page localisation for the extension UI.
// Locale data lives in _locales/<locale>/messages.json; the browser selects the
// catalogue that matches its own UI language and falls back to the default locale.
function t(key) {
  return chrome.i18n.getMessage(key) || key
}

function localizeDocument(root = document) {
  document.documentElement.lang = chrome.i18n.getUILanguage() || 'en'
  const documentTitleKey = document.documentElement.dataset.i18nDocumentTitle
  if (documentTitleKey) document.title = t(documentTitleKey)
  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n)
  }
  for (const element of root.querySelectorAll('[data-i18n-placeholder]')) {
    element.placeholder = t(element.dataset.i18nPlaceholder)
  }
  for (const element of root.querySelectorAll('[data-i18n-title]')) {
    element.title = t(element.dataset.i18nTitle)
  }
}
