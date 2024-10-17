import { Input } from '@web-archive/shared/components/input'
import { Label } from '@web-archive/shared/components/label'
import type { PageType } from 'popup/PopupPage'
import type { ChangeEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { onMessage, sendMessage } from 'webext-bridge/popup'
import Browser from 'webextension-polyfill'
import { Textarea } from '@web-archive/shared/components/textarea'
import { Button } from '@web-archive/shared/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@web-archive/shared/components/select'
import { useRequest } from 'ahooks'
import LoadingPage from './LoadingPage'

interface UploadPageFormProps {
  setActivePage: (page: PageType) => void
}

async function scrapePageData() {
  const tabs = await Browser.tabs.query({ active: true, currentWindow: true })
  const tab = tabs[0]

  if (!tab?.id) {
    return {
      title: '',
      pageDesc: '',
      content: '',
      href: '',
      folderId: '0',
      screenshot: '',
    }
  }

  const pageData = await sendMessage('get-current-page-data', { tabId: tab.id }, 'background')
  const screenshot = await Browser.tabs.captureVisibleTab(tab.windowId)
  return {
    title: pageData.title,
    pageDesc: pageData.pageDesc,
    content: pageData.content,
    href: pageData.href,
    folderId: '0',
    screenshot,
  }
}

async function getAllFolders() {
  const { folders } = await sendMessage('get-all-folders', {})
  return folders
}

function ScrapingPageProgress({ stage }: { stage: string }) {
  return (
    <div className="text-center">
      Scraping Page Data...
      <br />
      <span>
        {stage}
      </span>
    </div>
  )
}

function UploadPageForm({ setActivePage }: UploadPageFormProps) {
  const [uploadPageData, setUploadPageData] = useState({
    title: '',
    pageDesc: '',
    content: '',
    href: '',
    folderId: '0',
    screenshot: '',
  })
  const [loadingText, setLoadingText] = useState<string | ReactNode>('Scraping Page Data...')
  useEffect(() => {
    onMessage('scrape-page-progress', async ({ data }) => {
      setLoadingText(<ScrapingPageProgress stage={`${data.stage}`} />)
    })
  }, [])

  function handleChange(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target
    setUploadPageData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  function handleFolderSelect(newFolder: string) {
    console.log('folder select', newFolder)
    setUploadPageData(prevData => ({
      ...prevData,
      folderId: newFolder,
    }))
  }

  const { data: pageData, loading: isScrapingPage } = useRequest(scrapePageData)
  useEffect(() => {
    if (pageData) {
      setUploadPageData(pageData)
    }
  }, [pageData])

  function handleCancle() {
    setActivePage('home')
  }

  const [isSavingPage, setIsSavingPage] = useState(false)
  async function handleSavePage() {
    console.log('save page', uploadPageData)
    setLoadingText('Saving Page...')
    setIsSavingPage(true)
    const { success } = await sendMessage('save-page', {
      title: uploadPageData.title,
      pageDesc: uploadPageData.pageDesc,
      content: uploadPageData.content,
      href: uploadPageData.href,
      folderId: uploadPageData.folderId,
      screenshot: uploadPageData.screenshot,
    })
    if (success) {
      console.log('save success')
    }
    else {
      console.log('save failed')
    }
    setActivePage('home')
  }

  const { data: folderList } = useRequest(getAllFolders)

  if (isScrapingPage || isSavingPage) {
    return (
      <LoadingPage
        loadingText={loadingText}
      />
    )
  }

  return (
    <div className="w-64 p-4 space-y-4 flex flex-col">
      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="title"
        >
          Title
        </Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={uploadPageData.title}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="pageDesc"
        >
          Page Description
        </Label>
        <Textarea
          id="pageDesc"
          name="pageDesc"
          value={uploadPageData.pageDesc}
          rows={3}
          onChange={handleChange}
        >
        </Textarea>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="folderId"
        >
          Folder
        </Label>
        <Select
          name="folderId"
          value={uploadPageData.folderId}
          onValueChange={handleFolderSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="select folder"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {folderList && folderList.map(folder => (
              <SelectItem key={folder.id} value={folder.id.toString()}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handleCancle}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSavePage}
        >
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default UploadPageForm
