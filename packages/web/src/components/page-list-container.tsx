import { Button } from '@web-archive/shared/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@web-archive/shared/components/card'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import type { Page } from '@web-archive/shared/types'
import { useDrag, useInfiniteScroll } from 'ahooks'
import { ExternalLink, Move, Trash } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Empty from './empty'
import { useNavigate } from '~/router'
import { dragIcon } from '~/utils/drag'
import emitter from '~/utils/emitter'
import fetcher from '~/utils/fetcher'

interface PageListContainerProps {
  folderId?: number
  queryKeyword?: string
}

function PageListContainer({ folderId, queryKeyword }: PageListContainerProps) {
  const scrollRef = useRef(null)
  const PAGE_SIZE = 14
  const pageNum = useRef(1)
  const { data: pagesData, loading: pagesLoading, mutate: setPageData, loadingMore, reload } = useInfiniteScroll(
    async (d) => {
      if (loadingMore) {
        return {
          list: [],
        }
      }
      const list = await fetcher<Page[]>(`/pages/query`, {
        query: {
          folderId: folderId?.toString() ?? '',
          pageNumber: pageNum.current.toString(),
          pageSize: PAGE_SIZE.toString(),
        },
      })()
      pageNum.current += 1
      return {
        list: list ?? [],
      }
    },
    {
      target: () => {
        if (scrollRef.current)
          // @ts-expect-error todo fix type error
          return scrollRef.current.viewport
        return null
      },
      isNoMore: (d) => {
        if (!d)
          return false
        return d.list.length === 0 || d.list.length % PAGE_SIZE !== 0
      },
    },
  )

  useEffect(() => {
    pageNum.current = 1
    reload()
  }, [folderId, queryKeyword, reload])

  emitter.on('movePage', ({ pageId }) => {
    if (!pagesData)
      return
    setPageData({ list: pagesData.list.filter(page => page.id !== pageId) })
  })

  const handlePageDelete = async (page: Page) => {
    if (!pagesData)
      return

    try {
      await fetcher('/pages/delete_page', {
        method: 'DELETE',
        query: {
          id: page.id.toString(),
        },
      })()
      toast.success('Page deleted successfully')
      setPageData({ list: pagesData.list.filter(p => p.id !== page.id) })
    }
    catch (e) {
      toast.error('Failed to delete page')
    }
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4 overflow-auto">
      {
      pagesLoading || (!pagesData)
        ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
            <div>Loading...</div>
          </div>
          )
        : (
          <div className="h-full">
            {
              pagesData.list.length === 0
                ? (
                  <Empty className="h-full" />
                  )
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <PageList pages={pagesData.list.filter((_, index) => index % 3 === 0)} onPageDelete={handlePageDelete} />
                    <PageList pages={pagesData.list.filter((_, index) => index % 3 === 1)} onPageDelete={handlePageDelete} />
                    <PageList pages={pagesData.list.filter((_, index) => index % 3 === 2)} onPageDelete={handlePageDelete} />
                  </div>
                  )
            }
            {
              loadingMore && (
                <div className="w-full h-16 flex flex-col items-center justify-center mt-2">
                  <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
                  <div>Loading more...</div>
                </div>
              )
            }
          </div>
          )
    }

    </ScrollArea>
  )
}

function PageList({ pages, onPageDelete }: { pages?: Page[], onPageDelete: (page: Page) => void }) {
  return (
    <div className="flex flex-col space-y-4">
      {pages && pages.map(page => (
        <PageCard key={page.id} page={page} onPageDelete={onPageDelete} />
      ))}
    </div>
  )
}

function PageCard({ page, onPageDelete }: { page: Page, onPageDelete?: (page: Page) => void }) {
  const navigate = useNavigate()

  const handleClickPageCard = (page: Page) => {
    navigate('/page/:slug', { params: { slug: String(page.id) } })
  }

  const handleClickPageUrl = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation()
    window.open(page.pageUrl, '_blank')
  }

  const cardDragTarget = useRef(null)
  useDrag(page, cardDragTarget, {
    dragImage: {
      image: dragIcon,
    },
  })

  const handleDeletePage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this page?')) {
      onPageDelete?.(page)
    }
  }

  return (
    <Card
      key={page.id}
      onClick={() => handleClickPageCard(page)}
      className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
    >
      <CardHeader>
        <CardTitle className="leading-8 text-xl">{page.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="h-auto text-sm text-gray-600 dark:text-gray-400">{page.pageDesc}</p>
      </CardContent>
      <CardFooter className="flex space-x-2 justify-end">

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" ref={cardDragTarget}>
                <Move className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Drag to move this page
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={e => handleClickPageUrl(e, page)}>
                <ExternalLink className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Open in new tab
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleDeletePage}>
                <Trash className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete this page
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

export default PageListContainer
