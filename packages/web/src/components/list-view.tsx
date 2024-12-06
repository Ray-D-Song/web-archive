import type { Page } from '@web-archive/shared/types'
import { Table, TableBody, TableCell, TableRow } from '@web-archive/shared/components/table'
import React, { useState } from 'react'
import { useMouse } from 'ahooks'
import ScreenshotView from './screenshot-view'

interface ListViewProps {
  pages?: Page[]
  children?: (page: Page) => React.ReactNode
  imgPreview?: boolean
  onItemClick?: (page: Page, event: React.MouseEvent) => void
}

function ListView({ pages, children, imgPreview, onItemClick }: ListViewProps) {
  const mouse = useMouse()

  const [prevScreenshotId, setPrevScreenshotId] = useState<string | null>(null)
  const handleClickPage = (page: Page, event: React.MouseEvent) => {
    onItemClick?.(page, event)
  }
  const handleHoverPage = (e: React.MouseEvent, page: Page) => {
    if (imgPreview)
      setPrevScreenshotId(page.screenshotId ?? null)
  }
  const handleLeavePage = () => {
    setPrevScreenshotId(null)
  }

  return (
    <Table>
      <div
        className="fixed z-20 pointer-events-none"
        style={{
          top: mouse.pageY,
          left: mouse.pageX,
        }}
      >
        {
          prevScreenshotId
          && (
            <ScreenshotView
              screenshotId={prevScreenshotId}
              className="max-w-xs shadow-lg rounded"
              loadingClassName="max-w-xs shadow-lg rounded w-xs h-40"
            />
          )
        }
      </div>
      <TableBody>
        {pages?.map(page => (
          <TableRow key={page.id} className="cursor-pointer z-10" onClick={e => handleClickPage(page, e)} onMouseEnter={e => handleHoverPage(e, page)} onMouseLeave={handleLeavePage}>
            <TableCell className="line-clamp-3">{page.title}</TableCell>
            <TableCell>{page.createdAt.toLocaleString()}</TableCell>
            {children && (
              <TableCell>
                {children(page)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ListView
