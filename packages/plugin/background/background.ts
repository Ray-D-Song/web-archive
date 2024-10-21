import Browser from 'webextension-polyfill'
import '~/lib/browser-polyfill.min.js'
import '~/lib/single-file-background.js'
import { onMessage, sendMessage } from 'webext-bridge/background'
import { isNotNil } from '@web-archive/shared/utils'
import { base64ToBlob } from '~/utils/file.js'

async function appendAuthHeader(options?: RequestInit) {
  const { token } = await Browser.storage.local.get('token') ?? {}
  if (!options) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  options.headers = Object.assign(options?.headers ?? {}, {
    Authorization: `Bearer ${token}`,
  })
  return options
}

/* global RequestInit */
async function request(url: string, options?: RequestInit | undefined) {
  const { serverUrl } = await Browser.storage.local.get('serverUrl')
  const res = await fetch(`${serverUrl}/api${url}`, {
    credentials: 'same-origin',
    ...await appendAuthHeader(options),
  })
  if (res.ok) {
    const json = await res.json()
    if (json.code === 200) {
      return json.data
    }

    throw new Error(json.message)
  }
  throw new Error('Failed to fetch')
}

onMessage('set-server-url', async ({ data: { url } }) => {
  const serverUrl = url.endsWith('/') ? url.slice(0, -1) : url
  await Browser.storage.local.set({ serverUrl })
  return {
    success: true,
  }
})
onMessage('get-server-url', async () => {
  const { serverUrl } = await Browser.storage.local.get('serverUrl')
  return { serverUrl }
})

onMessage('save-page', async ({ data }) => {
  const { href, title, pageDesc, folderId, content } = data

  const form = new FormData()
  form.append('title', title)
  form.append('pageDesc', pageDesc)
  form.append('pageUrl', href)
  form.append('folderId', folderId)
  form.append('pageFile', new Blob([content], { type: 'text/html' }))
  if (isNotNil(data.screenshot)) {
    form.append('screenshot', base64ToBlob(data.screenshot, 'image/webp'))
  }

  try {
    await request('/pages/upload_new_page', {
      method: 'POST',
      body: form,
    })
    return { success: true }
  }
  catch {
    return { success: false }
  }
})

onMessage('check-auth', async () => {
  try {
    await request('/auth', {
      method: 'POST',
    })
    return {
      success: true,
    }
  }
  catch {
    return {
      success: false,
    }
  }
})

onMessage('get-token', async () => {
  const { token } = await Browser.storage.local.get('token')
  return { token }
})

onMessage('set-token', async ({ data: { token } }) => {
  await Browser.storage.local.set({ token })
  return { success: true }
})

onMessage('get-all-folders', async () => {
  const folders = await request('/folders/all', {
    method: 'GET',
  })
  return {
    folders,
  }
})

onMessage('get-current-page-data', async ({ data: { tabId, ...singleFileSetting } }) => {
  await Browser.scripting.executeScript({
    target: { tabId },
    files: ['/lib/single-file.js', '/lib/single-file-extension-core.js'],
  })
  const pageData = await sendMessage('scrape-page-data', singleFileSetting, `content-script@${tabId}`)
  return pageData
})
