import { isNil } from '@web-archive/shared/utils'
import { useOutletContext } from 'react-router-dom'
import { useInfiniteScroll, useRequest } from 'ahooks'
import { memo, useEffect, useRef } from 'react'
import type { Page } from '@web-archive/shared/types'
import type { Ref } from '@web-archive/shared/components/scroll-area'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { useParams } from '~/router'
import NotFound from '~/components/not-found'
import Empty from '~/components/empty'
import PageCard from '~/components/page-card'
import LoadingWrapper from '~/components/loading-wrapper'
import { deletePage, queryPage } from '~/data/page'
import emitter from '~/utils/emitter'

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
    reload()
  }, [searchTrigger])

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

  if (isNil(slug))
    return <NotFound />

  return (
    <div className="flex flex-col flex-1">
      <ScrollArea ref={scrollRef} className="flex-1 p-4 overflow-auto">
        <LoadingWrapper loading={pagesLoading || (!pagesData)}>
          <div className="h-full">
            {
              pagesData?.list.length === 0
                ? (
                  <Empty className="h-full" />
                  )
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <PageCardList pages={pagesData?.list.filter((_, index) => index % 3 === 0)} onPageDelete={handleDeletePage} />
                    <PageCardList pages={pagesData?.list.filter((_, index) => index % 3 === 1)} onPageDelete={handleDeletePage} />
                    <PageCardList pages={pagesData?.list.filter((_, index) => index % 3 === 2)} onPageDelete={handleDeletePage} />
                  </div>
                  )
                }
            {loadingMore && <LoadingMore />}
          </div>
        </LoadingWrapper>
      </ScrollArea>
    </div>
  )
}

function PageCardList({ pages, onPageDelete }: { pages?: Page[], onPageDelete: (page: Page) => void }) {
  return (
    <div className="flex flex-col space-y-4">
      {pages && pages.map(page => (
        <PageCard key={page.id} page={page} onPageDelete={onPageDelete} />
      ))}
    </div>
  )
}

export default FolderPage
