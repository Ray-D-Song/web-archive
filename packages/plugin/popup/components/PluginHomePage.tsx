import { Button } from '@web-archive/shared/components/button'
import { House, LogOut } from 'lucide-react'
import { PageType } from 'popup/PopupPage'
import { sendMessage } from 'webext-bridge/popup'
import { ThemeToggle } from './ThemeToggle'

interface PluginHomePageProps {
  setActivePage: (tab: PageType) => void
}

function PluginHomePage({ setActivePage }: PluginHomePageProps) {
  async function logout() {
    await sendMessage('set-token', { token: '' })
    setActivePage('login')
  }

  async function openServerPage() {
    const { serverUrl } = await sendMessage('get-server-url', {})
    window.open(serverUrl, '_blank')
  }

  return (
    <div className="w-64 space-y-1.5 p-4">
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-3">
          <House
            className="cursor-pointer"
            size={16}
            onClick={openServerPage}
          >
          </House>
          <ThemeToggle></ThemeToggle>
        </div>

        <LogOut
          className="cursor-pointer"
          size={16}
          onClick={logout}
        />
      </div>
      <Button
        className="w-full"
        onClick={() => { setActivePage('upload') }}
      >
        Save Page
      </Button>
    </div>
  )
}

export default PluginHomePage
