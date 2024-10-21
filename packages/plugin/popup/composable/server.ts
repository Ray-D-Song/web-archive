import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { sendMessage } from 'webext-bridge/popup'

export function useServerUrl() {
  const [serverUrl, setServerUrl] = useState('')
  useEffect(() => {
    sendMessage('get-server-url', {}).then(({ serverUrl }) => {
      setServerUrl(serverUrl)
    })
  }, [])

  function saveServerUrl(e: ChangeEvent<HTMLInputElement>) {
    setServerUrl(e.target.value)
    sendMessage('set-server-url', { url: e.target.value }).then(({ success }) => {
      if (success) {
        console.log('save server url success')
      }
      else {
        console.log('save server url failed')
      }
    })
  }
  return [serverUrl, saveServerUrl] as const
}

export function useToken() {
  const [token, setToken] = useState('')
  useEffect(() => {
    sendMessage('get-token', {}).then(({ token }) => {
      setToken(token)
    })
  }, [])

  function saveToken(e: ChangeEvent<HTMLInputElement>) {
    setToken(e.target.value)
    sendMessage('set-token', { token: e.target.value }).then(({ success }) => {
      if (success) {
        console.log('save token success')
      }
      else {
        console.log('save token failed')
      }
    })
  }
  return [token, saveToken] as const
}
