import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { ArrowLeft, Trash } from 'lucide-react'
import { useEffect } from 'react'
import { deletePage, getPageDetail } from '~/data/page'
import { useNavigate, useParams } from '~/router'

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
    getPageDetail,
    {
      onSuccess: (pageDetail) => {
        if (!pageDetail) {
          navigate('/error/:slug', { params: { slug: '404' } })
        }
      },
      defaultParams: [slug],
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
    deletePage,
    {
      manual: true,
    },
  )
  const handleDeletePage = async () => {
    if (!window.confirm('Are you sure you want to delete this page?'))
      return
    if (!pageDetail)
      return
    await runDeletePage(pageDetail)
    goBack()
  }

  return (
    <>
      <nav className="p-2 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex space-x-2">
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
                className="w-full h-full bg-current"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              )
        }
      </div>
    </>
  )
}

export default ArchivePage
