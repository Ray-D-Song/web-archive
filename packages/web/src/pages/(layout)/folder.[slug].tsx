import { isNil } from '@web-archive/shared/utils'
import { useOutletContext } from 'react-router-dom'
import { useInfiniteScroll, useRequest } from 'ahooks'
import { memo, useContext, useEffect, useRef } from 'react'
import type { Ref } from '@web-archive/shared/components/scroll-area'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { Button } from '@web-archive/shared/components/button'
import { Trash } from 'lucide-react'
import type { Page } from '@web-archive/shared/types'
import { useNavigate, useParams } from '~/router'
import NotFound from '~/components/not-found'
import LoadingWrapper from '~/components/loading-wrapper'
import { deletePage, queryPage } from '~/data/page'
import emitter from '~/utils/emitter'
import CardView from '~/components/card-view'
import EmptyWrapper from '~/components/empty-wrapper'
import ListView from '~/components/list-view'
import AppContext from '~/store/app'

const LoadingMore = memo(() => {
  return (
    <div className="w-full h-16 flex flex-col items-center justify-center mt-2">
      <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
      <div>Loading more...</div>
    </div>
  )
})

function FolderPage() {
  const { slug } = useParams('/folder/:slug')

  const scrollRef = useRef<Ref>(null)
  const { keyword, searchTrigger } = useOutletContext<{ keyword: string, searchTrigger: boolean }>()
  const totalCount = useRef(0)
  const PAGE_SIZE = 14
  const pageNum = useRef(1)
  const { data: pagesData, loading: pagesLoading, mutate: setPageData, loadingMore, reload } = useInfiniteScroll(
    async () => {
      if (loadingMore) {
        return {
          list: [],
        }
      }
      const res = await queryPage({
        folderId: slug,
        pageNumber: pageNum.current,
        pageSize: PAGE_SIZE,
        keyword,
      })
      pageNum.current += 1
      totalCount.current = res.total
      return {
        list: res.list ?? [],
      }
    },
    {
      target: scrollRef.current?.viewport,
      isNoMore: (d) => {
        if (!d)
          return false
        return d.list.length === totalCount.current
      },
    },
  )
  useEffect(() => {
    pageNum.current = 1
    reload()
  }, [searchTrigger, slug])

  const { run: handleDeletePage } = useRequest(deletePage, {
    manual: true,
    onSuccess: (data) => {
      setPageData({ list: pagesData?.list.filter(page => page.id !== data?.id) ?? [] })
    },
  })

  emitter.on('movePage', ({
    pageId,
    folderId,
  }) => {
    if (folderId !== Number(slug))
      setPageData({ list: pagesData?.list.filter(page => page.id !== pageId) ?? [] })
  })

  const navigate = useNavigate()
  const handleItemClick = (page: Page) => {
    navigate(`/page/:slug`, { params: { slug: String(page.id) } })
  }

  const { view } = useContext(AppContext)

  if (isNil(slug))
    return <NotFound />

  return (
    <div className="flex flex-col flex-1">
      <ScrollArea ref={scrollRef} className="p-4 overflow-auto h-[calc(100vh-58px)]">
        <LoadingWrapper loading={pagesLoading || (!pagesData)}>
          <div className="h-full">
            <EmptyWrapper empty={pagesData?.list.length === 0}>
              {view === 'card'
                ? (
                  <CardView pages={pagesData?.list} onPageDelete={handleDeletePage} />
                  )
                : (
                  <ListView pages={pagesData?.list} onItemClick={handleItemClick} imgPreview>
                    {page => (
                      <Button
                        variant="link"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePage(page)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </ListView>
                  )}
            </EmptyWrapper>
            {loadingMore && <LoadingMore />}
          </div>
        </LoadingWrapper>
      </ScrollArea>
    </div>
  )
}

export default FolderPage
