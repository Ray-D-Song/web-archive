import type { Browser } from 'webextension-polyfill'

declare const browser: Browser

(async () => {
  // We have to provide the resource as web_accessible in manifest.json
  // So that its available when we request using chrome.runtime.getURL
  const src = browser.runtime.getURL('contentScripts/content.js')
  await import(src)
})()
