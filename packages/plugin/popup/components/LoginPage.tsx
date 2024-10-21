import { sendMessage } from 'webext-bridge/popup'
import { Button } from '@web-archive/shared/components/button'
import { Label } from '@web-archive/shared/components/label'
import { Input } from '@web-archive/shared/components/input'
import { useServerUrl, useToken } from '~/popup/composable/server'
import type { PageType } from '~/popup/PopupPage'

function LoginPage({ setActivePage }: { setActivePage: (tab: PageType) => void }) {
  const [serverUrl, saveServerUrl] = useServerUrl()
  const [token, saveToken] = useToken()

  function checkAuth() {
    sendMessage('check-auth', {}).then(({ success }) => {
      if (success) {
        setActivePage('home')
      }
      else {
        console.log('auth failed')
      }
    })
  }

  return (
    <div className="w-64 space-y-3 p-4 ">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="serverUrl">Server URL</Label>
        <Input
          id="serverUrl"
          placeholder="Enter the server url"
          value={serverUrl}
          onChange={saveServerUrl}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="token">Token</Label>
        <Input
          id="token"
          placeholder="Enter the token"
          value={token}
          onChange={saveToken}
        />
      </div>

      <Button
        className="w-full"
        onClick={checkAuth}
      >
        Save
      </Button>
    </div>
  )
}

export default LoginPage
