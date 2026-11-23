import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { ArrowLeft, Trash } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IframePageContent from '~/components/iframe-page-content'
import LoadingWrapper from '~/components/loading-wrapper'
import ReadabilityPageContent from '~/components/readability-page-content'
import SharePagePopover from '~/components/share-page-popover'
import { deletePage, getPageDetail } from '~/data/page'
import { useObjectURL } from '~/hooks/useObjectUrl'
import { useNavigate, useParams } from '~/router'
import AppContext from '~/store/app'

async function getPageContent(pageId: string | undefined) {
  if (!pageId)
    return ''
  const url = `/api/pages/content?pageId=${pageId}`
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
  const { t } = useTranslation()
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
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0)
      window.history.back()
    else if (pageDetail)
      navigate('/folder/:slug', { params: { slug: String(pageDetail.folderId) } })
    else
      navigate('/')
  }

  const { objectURL: pageContentUrl, setObject } = useObjectURL(null)
  const { data: pageHtml, loading: pageLoading } = useRequest(
    async () => {
      const pageHtml = await getPageContent(slug)
      return pageHtml
    },
    {
      onSuccess: (pageHtml) => {
        setObject(pageHtml)
      },
    },
  )

  const { runAsync: runDeletePage } = useRequest(
    deletePage,
    {
      manual: true,
    },
  )
  const handleDeletePage = async () => {
    if (!window.confirm(t('delete-this-page-confirm')))
      return
    if (!pageDetail)
      return
    await runDeletePage(pageDetail)
    goBack()
  }

  const { readMode, setReadMode } = useContext(AppContext)

  return (
    <main className="h-screen w-screen lg:w-full flex flex-col">
      <nav className="p-2 w-full flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex space-x-2">
          {pageDetail && (
            <SharePagePopover pageId={pageDetail.id} variant="outline" size="sm" />
          )}
          <a
            href={pageContentUrl ?? ''}
            download={`${pageDetail?.title ?? 'Download'}.html`}
          >
            <Button
              variant="default"
              size="sm"
            >
              {t('download')}
            </Button>
          </a>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setReadMode(!readMode)}
          >
            {readMode ? t('open-iframe-mode') : t('open-read-mode')}
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
      <div className="flex-1 p-4 w-full">
        <LoadingWrapper loading={pageLoading}>
          {readMode
            ? <ReadabilityPageContent pageHtml={pageHtml || ''} />
            : <IframePageContent pageContentUrl={pageContentUrl || ''} />}
        </LoadingWrapper>
      </div>
    </main>
  )
}

export default ArchivePage
