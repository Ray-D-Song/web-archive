import type { Page } from '@web-archive/shared/types'
import React, { memo, useContext, useState } from 'react'
import { useRequest } from 'ahooks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@web-archive/shared/components/card'
import { Button } from '@web-archive/shared/components/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { ExternalLink, Eye, EyeOff, SquarePen, Trash } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BadgeSpan } from '@web-archive/shared/components/badge'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import ScreenshotView from './screenshot-view'
import { updatePageShowcase } from '~/data/page'
import CardEditDialog from '~/components/card-edit-dialog'
import SharePagePopover from '~/components/share-page-popover'
import TagContext from '~/store/tag'
import { Link } from '~/router'

function Comp({ page, onPageDelete }: { page: Page, onPageDelete?: (page: Page) => void }) {
  const { t } = useTranslation()
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const bindTags = tagCache?.filter(tag => tag.pageIds.includes(page.id)) ?? []
  const tagBadgeList = bindTags.map((tag) => {
    return (<BadgeSpan key={tag.id} variant="outline" className="select-none">{tag.name}</BadgeSpan>)
  })

  const location = useLocation()
  const isShowcased = location.pathname.startsWith('/showcase')
  const redirectTo = isShowcased ? `/showcase/page/:slug` : `/page/:slug`

  const handleClickPageUrl = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation()
    window.open(page.pageUrl, '_blank')
  }

  const handleDeletePage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(t('delete-this-page-confirm'))) {
      onPageDelete?.(page)
    }
  }

  const [showcaseState, setShowcaseState] = useState(page.isShowcased)
  const { run: updateShowcase } = useRequest(
    updatePageShowcase,
    {
      manual: true,
      onSuccess() {
        toast.success(t('success'))
        setShowcaseState(showcaseState === 1 ? 0 : 1)
      },
    },
  )

  const [openCardEditDialog, setOpenCardEditDialog] = useState(false)
  const handleEditPage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await refreshTagCache()
    setOpenCardEditDialog(true)
  }

  return (
    <div>
      {
        !isShowcased && (
          <CardEditDialog open={openCardEditDialog} onOpenChange={setOpenCardEditDialog} pageId={page.id} />
        )
      }

      <Card
        key={page.id}
        className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col relative group overflow-hidden"
      >
        <Link to={redirectTo} params={{ slug: page.id.toString() }}>
          <CardHeader>
            <CardTitle className="leading-8 text-lg line-clamp-2">{page.title}</CardTitle>
            <CardDescription className="space-x-1">
              {tagBadgeList}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ScreenshotView
              screenshotId={page.screenshotId}
              className="w-full mb-2"
              loadingClassName="w-full h-48"
            >
            </ScreenshotView>
            <p className="h-auto text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{page.pageDesc}</p>
          </CardContent>
        </Link>

        <CardFooter className="flex space-x-2 justify-end w-full backdrop-blur-sm py-4 absolute bottom-0 group-hover:opacity-100 sm:opacity-0 transition-opacity">
          {
            !isShowcased && (
              <>
                <SharePagePopover pageId={page.id} variant="outline" size="sm" />
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditPage}
                      >
                        <SquarePen className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('edit-page')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )
          }

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={e => handleClickPageUrl(e, page)}>
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  {t('open-original-link')}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          {
            !isShowcased && (
              <>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleDeletePage}>
                        <Trash className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('delete-page')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateShowcase({ id: page.id, isShowcased: showcaseState === 1 ? 0 : 1 })
                        }}
                      >
                        {
                          showcaseState === 1 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />
                        }
                      </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent>
                        {
                          showcaseState === 1
                            ? t('remove-from-showcase')
                            : t('add-to-showcase')
                        }
                      </TooltipContent>
                    </TooltipPortal>

                  </Tooltip>
                </TooltipProvider>
              </>
            )
          }
        </CardFooter>
      </Card>
    </div>
  )
}

const PageCard = memo(Comp)

export default PageCard
