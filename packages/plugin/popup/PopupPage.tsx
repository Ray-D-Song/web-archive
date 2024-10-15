import { useEffect, useState } from 'react'

import { sendMessage } from 'webext-bridge/popup'
import LoginPage from './components/LoginPage'
import PluginHomePage from './components/PluginHomePage'
import UploadPageForm from './components/UploadPageForm'
import LoadingPage from './components/LoadingPage'

export type PageType = 'home' | 'login' | 'loading' | 'upload'

function PopupContainer() {
  const [activeTab, setActivePage] = useState<PageType>('loading')

  useEffect(() => {
    sendMessage('check-auth', {}).then(({ success }) => {
      setActivePage(success ? 'home' : 'login')
    })
  }, [])

  const tabs = {
    home: <PluginHomePage setActivePage={setActivePage} />,
    login: <LoginPage setActivePage={setActivePage} />,
    loading: <LoadingPage loadingText="Loading..."></LoadingPage>,
    upload: <UploadPageForm setActivePage={setActivePage} />,
  }

  return (
    tabs[activeTab]
  )
}

export default PopupContainer
