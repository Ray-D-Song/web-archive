import type { Page } from '@web-archive/shared/types'
import React, { useRef } from 'react'
import { useDrag } from 'ahooks'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@web-archive/shared/components/card'
import { Button } from '@web-archive/shared/components/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { ExternalLink, Move, Trash } from 'lucide-react'
import { useNavigate } from '~/router'
import { dragIcon } from '~/utils/drag'

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
        <CardTitle className="leading-8 text-lg">{page.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {
          page.screenshot && (
            <img src={page.screenshot} className="mb-2" />
          )
        }
        <p className="h-auto text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{page.pageDesc}</p>
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

export default PageCard
