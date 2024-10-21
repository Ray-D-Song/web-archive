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
import Compressor from 'compressorjs'
import { isNil } from '@web-archive/shared/utils'
import { Loader2 } from 'lucide-react'
import { getSingleFileSetting } from '../utils/singleFile'
import LoadingPage from '~/popup/components/LoadingPage'
import { base64ToBlob, blobToBase64 } from '~/utils/file'

interface UploadPageFormProps {
  setActivePage: (page: PageType) => void
}

async function getImageSize(base64: string) {
  return new Promise<{
    height: number
    width: number
  }>((resolve) => {
    const img = new Image()
    img.src = base64
    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width,
      })
    }
  })
}

async function compressImage(base64: string) {
  const { height, width } = await getImageSize(base64)
  const blob = base64ToBlob(base64)
  const compressedFile = await new Promise<Blob>((resolve) => {
    // eslint-disable-next-line no-new -- to compress image
    new Compressor(blob, {
      quality: 0.6,
      mimeType: 'image/webp',
      width: Math.min(1280, width),
      height: Math.min(1280, width) * (height / width),
      success(result) {
        console.log('compressed', result)
        resolve(result)
      },
    })
  })
  return await blobToBase64(compressedFile)
}

async function takeScreenshot(windowId: number | undefined): Promise<string | undefined> {
  if (isNil(windowId)) {
    return undefined
  }
  const screenshot = await Browser.tabs.captureVisibleTab(windowId)
  return await compressImage(screenshot)
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
      screenshot: undefined,
    }
  }

  const pageData = await sendMessage('get-current-page-data', { tabId: tab.id, ...getSingleFileSetting() }, 'background')
  const screenshot = await takeScreenshot(tab.windowId)
  return {
    title: pageData.title,
    pageDesc: pageData.pageDesc,
    content: pageData.content,
    href: pageData.href,
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
    folderId: undefined as undefined | string,
    screenshot: undefined as undefined | string,
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

  const { loading: isScrapingPage } = useRequest(
    scrapePageData,
    {
      onSuccess: (data) => {
        setUploadPageData({
          ...uploadPageData,
          ...data,
        })
      },
    },
  )

  function handleCancle() {
    setActivePage('home')
  }

  const [isSavingPage, setIsSavingPage] = useState(false)
  async function handleSavePage() {
    console.log('save page', uploadPageData)
    if (isNil(uploadPageData.folderId)) {
      // todo show error
      return
    }
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

  const { data: folderList, loading: loadingFolder } = useRequest(getAllFolders, {
    onSuccess: (data) => {
      if (isNil(uploadPageData.folderId) && data.length > 0) {
        setUploadPageData(prevData => ({
          ...prevData,
          folderId: data[0].id.toString(),
        }))
      }
    },
  })

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
          disabled={isNil(uploadPageData.folderId)}
          onClick={handleSavePage}
        >
          {
            loadingFolder
              ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                  Loading
                </span>
                )
              : (
                  'Confirm'
                )
          }
        </Button>
      </div>
    </div>
  )
}

export default UploadPageForm
