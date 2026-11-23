import { Button } from '@web-archive/shared/components/button'
import { useKeyPress, useRequest } from 'ahooks'
import { ArrowLeft, ArrowRight, House } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IframePageContent from '~/components/iframe-page-content'
import LoadingWrapper from '~/components/loading-wrapper'
import PoweredBy from '~/components/powerd-by'
import ReadabilityPageContent from '~/components/readability-page-content'
import { getNextShowcasePageId, getShowcaseDetail } from '~/data/showcase'
import { useObjectURL } from '~/hooks/useObjectUrl'
import { useNavigate, useParams } from '~/router'
import AppContext from '~/store/app'

async function getPageContent(pageId: string | undefined) {
  if (!pageId)
    return ''
  const url = `/api/showcase/content?pageId=${pageId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  })
  return await res.text()
}

function ShowcasePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slug } = useParams('/showcase/page/:slug')
  useEffect(() => {
    if (!slug) {
      navigate('/showcase/folder')
    }
  })

  const { data: pageDetail } = useRequest(
    async () => {
      if (!slug)
        return undefined
      return getShowcaseDetail(slug)
    },
    {
      refreshDeps: [slug],
    },
  )

  const { run: goNext, loading: getNextLoading } = useRequest(
    getNextShowcasePageId,
    {
      manual: true,
      onSuccess(nextId) {
        navigate('/showcase/page/:slug', {
          params: {
            slug: String(nextId),
          },
        })
      },
    },
  )

  const goBack = () => {
    window.history.back()
  }
  const goHome = () => {
    navigate('/showcase/folder')
  }

  useKeyPress('leftarrow', () => {
    goBack()
  })
  useKeyPress('rightarrow', () => {
    goNext(Number(slug))
  })

  const { objectURL: pageContentUrl, setObject } = useObjectURL(null)
  const { data: pageHtml, loading: pageLoading } = useRequest(
    async () => {
      const pageHtml = await getPageContent(slug)
      return pageHtml
    },
    {
      refreshDeps: [slug],
      onSuccess: (pageHtml) => {
        setObject(pageHtml)
      },
    },
  )

  const { readMode, setReadMode } = useContext(AppContext)

  return (
    <main className="h-screen w-screen flex flex-col">
      <nav className="px-2 py-1.5 w-full flex justify-between items-center border-b">
        <Button variant="ghost" size="sm" onClick={goHome}>
          <House className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
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
          <PoweredBy />
        </div>
      </nav>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <nav className="p-1 justify-between items-center hidden xl:flex">
          <Button variant="ghost" size="sm" onClick={goBack} className="h-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </nav>
        <div className="flex-1 p-2 h-full overflow-auto">
          <LoadingWrapper loading={pageLoading || getNextLoading}>
            {readMode
              ? <ReadabilityPageContent pageHtml={pageHtml || ''} />
              : <IframePageContent pageContentUrl={pageContentUrl || ''} />}
          </LoadingWrapper>
        </div>
        <nav className="p-1 justify-between items-center hidden xl:flex">
          <Button variant="ghost" size="sm" onClick={() => goNext(Number(slug))} className="h-full">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </nav>
      </div>
    </main>
  )
}

export default ShowcasePage
