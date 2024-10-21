import { useEffect, useState } from 'react'

import { sendMessage } from 'webext-bridge/popup'
import SettingPage from '~/popup/components/SettingPage'
import LoginPage from '~/popup/components/LoginPage'
import PluginHomePage from '~/popup/components/PluginHomePage'
import UploadPageForm from '~/popup/components/UploadPageForm'
import LoadingPage from '~/popup/components/LoadingPage'

export type PageType = 'home' | 'login' | 'loading' | 'upload' | 'setting'

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
    setting: <SettingPage setActivePage={setActivePage} />,
  }

  return (
    tabs[activeTab]
  )
}

export default PopupContainer
