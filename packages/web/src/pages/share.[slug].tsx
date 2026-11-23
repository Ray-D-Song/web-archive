import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IframePageContent from '~/components/iframe-page-content'
import LoadingWrapper from '~/components/loading-wrapper'
import PoweredBy from '~/components/powerd-by'
import ReadabilityPageContent from '~/components/readability-page-content'
import { getSharedPageDetail } from '~/data/share'
import { useObjectURL } from '~/hooks/useObjectUrl'
import { useNavigate, useParams } from '~/router'
import AppContext from '~/store/app'

async function getSharedPageContent(token: string | undefined) {
  if (!token)
    return ''
  const url = `/api/share/content?token=${encodeURIComponent(token)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  })
  if (!res.ok)
    return ''
  return await res.text()
}

function SharedPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slug } = useParams('/share/:slug')

  useEffect(() => {
    if (!slug) {
      navigate('/error/:slug', { params: { slug: '404' } })
    }
  }, [slug, navigate])

  const { data: pageDetail, loading: detailLoading } = useRequest(
    async () => {
      if (!slug)
        return null
      return getSharedPageDetail(slug)
    },
    {
      refreshDeps: [slug],
      onSuccess: (detail) => {
        if (!detail) {
          navigate('/error/:slug', { params: { slug: '404' } })
        }
      },
    },
  )

  const { objectURL: pageContentUrl, setObject } = useObjectURL(null)
  const { data: pageHtml, loading: pageLoading } = useRequest(
    async () => {
      return getSharedPageContent(slug)
    },
    {
      refreshDeps: [slug],
      onSuccess: (html) => {
        setObject(html)
      },
    },
  )

  const { readMode, setReadMode } = useContext(AppContext)

  return (
    <main className="h-screen w-screen flex flex-col">
      <nav className="px-2 py-1.5 w-full flex justify-between items-center border-b gap-2">
        <div className="font-medium text-sm truncate px-2">
          {pageDetail?.title}
        </div>
        <div className="flex items-center space-x-2 shrink-0">
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
      <div className="flex-1 p-2 min-h-0 overflow-auto">
        <LoadingWrapper loading={detailLoading || pageLoading}>
          {readMode
            ? <ReadabilityPageContent pageHtml={pageHtml || ''} />
            : <IframePageContent pageContentUrl={pageContentUrl || ''} />}
        </LoadingWrapper>
      </div>
    </main>
  )
}

export default SharedPage
