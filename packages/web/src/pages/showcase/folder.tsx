import { useInfiniteScroll } from 'ahooks'
import { useRef } from 'react'
import type { Ref } from '@web-archive/shared/components/scroll-area'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import LoadingWrapper from '~/components/loading-wrapper'
import CardView from '~/components/card-view'
import EmptyWrapper from '~/components/empty-wrapper'
import { queryShowcase } from '~/data/showcase'
import LoadingMore from '~/components/loading-more'
import PoweredBy from '~/components/powerd-by'

function ShowcaseFolderPage() {
  const scrollRef = useRef<Ref>(null)
  const PAGE_SIZE = 14
  const { data: pagesData, loading: pagesLoading, loadingMore } = useInfiniteScroll(
    async (d) => {
      const pageNumber = d?.pageNumber ?? 1
      const res = await queryShowcase({
        pageNumber,
        pageSize: PAGE_SIZE,
      })
      return {
        list: res.list ?? [],
        pageNumber: pageNumber + 1,
        total: res.total,
      }
    },
    {
      target: scrollRef.current?.viewport,
      isNoMore: (d) => {
        if (!d)
          return false
        return d.list.length >= d.total || d.pageNumber > Math.ceil(d.total / PAGE_SIZE)
      },
    },
  )

  return (
    <div className="flex flex-col flex-1">
      <PoweredBy className="m-2 self-end" />
      <ScrollArea ref={scrollRef} className="p-4 overflow-auto h-[calc(100vh-52px)]">
        <LoadingWrapper loading={pagesLoading || (!pagesData)}>
          <div className="h-full">
            <EmptyWrapper empty={pagesData?.list.length === 0}>
              <CardView pages={pagesData?.list} onPageDelete={() => { }} />
            </EmptyWrapper>
            {loadingMore && <LoadingMore />}
          </div>
        </LoadingWrapper>
      </ScrollArea>
    </div>
  )
}

export default ShowcaseFolderPage
