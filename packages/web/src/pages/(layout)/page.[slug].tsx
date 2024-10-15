import { Button } from '@web-archive/shared/components/button'
import type { Page } from '@web-archive/shared/types'
import { useKeyPress, useRequest } from 'ahooks'
import { ArrowLeft, Maximize, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '~/router'
import fetcher from '~/utils/fetcher'

async function getPageContent(pageId: string | undefined) {
  if (!pageId)
    return ''
  const url = `/api/shelf?pageId=${pageId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
  return await res.text()
}

function ArchivePage() {
  const navigate = useNavigate()
  const { slug } = useParams('/page/:slug')

  useEffect(() => {
    if (!slug) {
      navigate('/')
    }
  })

  const { data: pageDetail } = useRequest(
    fetcher<Page>('/pages/get_page', {
      query: {
        id: slug ?? '',
      },
      method: 'GET',
    }),
    {
      onSuccess: (pageDetail) => {
        if (!pageDetail) {
          navigate('/error/:slug', { params: { slug: '404' } })
        }
      },
    },
  )

  const goBack = () => {
    if (pageDetail)
      navigate('/folder/:slug', { params: { slug: String(pageDetail?.folderId) } })
    else
      window.history.back()
  }

  const { data: pageContentUrl, loading: pageLoading } = useRequest(async () => {
    const pageHtml = await getPageContent(slug)
    const objectUrl = URL.createObjectURL(new Blob([pageHtml], { type: 'text/html' }))
    return objectUrl
  })
  useEffect(() => {
    return () => {
      pageContentUrl && URL.revokeObjectURL(pageContentUrl)
    }
  }, [pageContentUrl])

  const { runAsync: runDeletePage } = useRequest(
    fetcher('/pages/delete_page', {
      method: 'DELETE',
      query: {
        id: slug,
      },
    }),
    {
      manual: true,
    },
  )
  const handleDeletePage = async () => {
    if (!window.confirm('Are you sure you want to delete this page?'))
      return
    await runDeletePage()
    goBack()
  }

  const [isFullScreen, setIsFullScreen] = useState(false)
  const handleFullScreen = () => {
    setIsFullScreen(true)
  }
  const ESCCode = 27
  useKeyPress(ESCCode, () => {
    if (isFullScreen)
      setIsFullScreen(false)
  })

  return (
    <>
      <nav className="p-2 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullScreen}
          >
            <Maximize className="w-5 h-5" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeletePage}
          >
            <Trash className="w-5 h-5" />
          </Button>
        </div>
      </nav>
      <div className="flex-1 p-4">
        {
          pageLoading
            ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
                <div>Loading...</div>
              </div>
              )
            : (
              <iframe
                src={pageContentUrl}
                className={`${isFullScreen ? 'fixed inset-0 w-screen h-screen bg-current' : 'w-full h-full bg-current'}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              )
        }
      </div>
    </>
  )
}

export default ArchivePage
