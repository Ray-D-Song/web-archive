import type { Page } from '@web-archive/shared/types'
import { Table, TableBody, TableCell, TableRow } from '@web-archive/shared/components/table'
import { useState } from 'react'
import { useMouse } from 'ahooks'

interface ListViewProps {
  pages?: Page[]
  children?: (page: Page) => React.ReactNode
  imgPreview?: boolean
  onItemClick?: (page: Page) => void
}

function ListView({ pages, children, imgPreview, onItemClick }: ListViewProps) {
  const mouse = useMouse()

  const [prevImg, setPrevImg] = useState<string | null>(null)
  const handleClickPage = (page: Page) => {
    onItemClick?.(page)
  }
  const handleHoverPage = (e: React.MouseEvent, page: Page) => {
    if (imgPreview)
      setPrevImg(page.screenshot ?? null)
  }
  const handleLeavePage = () => {
    setPrevImg(null)
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
        {prevImg && <img src={prevImg} alt="page preview" className="max-w-xs shadow-lg rounded" />}
      </div>
      <TableBody>
        {pages?.map(page => (
          <TableRow key={page.id} className="cursor-pointer z-10" onClick={() => handleClickPage(page)} onMouseEnter={e => handleHoverPage(e, page)} onMouseLeave={handleLeavePage}>
            <TableCell>{page.title}</TableCell>
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
