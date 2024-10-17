import { Button } from '@web-archive/shared/components/button'
import { useInfiniteScroll, useRequest } from 'ahooks'
import { useRef } from 'react'
import { queryDeletedFolder, restoreFolder } from '~/data/folder'
import { queryDeletedPage, restorePage } from '~/data/page'

function TrashPage() {
  return (
    <div className="flex justify-center h-64 border">
      <DeletedPageList></DeletedPageList>
    </div>
  )
}

function DeletedFolderList() {
  const deleteFolderListRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 14
  const pageNum = useRef(1)
  const totalCount = useRef(0)
  const { data: deletedFolderList, loadingMore } = useInfiniteScroll(
    async () => {
      if (loadingMore) {
        return {
          list: [],
        }
      }
      const res = await queryDeletedFolder({
        pageNumber: pageNum.current,
        pageSize: PAGE_SIZE,
      })

      pageNum.current += 1
      totalCount.current = res.total
      return {
        list: res.list ?? [],
      }
    },
    {
      target: deleteFolderListRef,
      isNoMore: (d) => {
        if (!d)
          return false
        return d.list.length === totalCount.current
      },
    },
  )

  const { run: runRestoreFolder } = useRequest(restoreFolder, {
    manual: true,
  })

  return (
    <div ref={deleteFolderListRef} className="h-64 w-full border">
      {deletedFolderList?.list.map(folder => (
        <div key={folder.id}>
          <div>{folder.name}</div>
          <Button onClick={() => runRestoreFolder(folder.id)}>Restore</Button>
        </div>
      ))}
    </div>
  )
}

function DeletedPageList() {
  const deletePageListRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 14
  const pageNum = useRef(1)
  const totalCount = useRef(0)
  const { data: deletedPageList, loadingMore } = useInfiniteScroll(
    async () => {
      if (loadingMore) {
        return {
          list: [],
        }
      }
      const res = await queryDeletedPage({
        pageNumber: pageNum.current,
        pageSize: PAGE_SIZE,
      })

      pageNum.current += 1
      totalCount.current = res.total
      return {
        list: res.list ?? [],
      }
    },
    {
      target: deletePageListRef,
      isNoMore: (d) => {
        if (!d)
          return false
        return d.list.length === totalCount.current
      },
    },
  )

  const { run: runRestorePage } = useRequest(restorePage, {
    manual: true,
  })

  return (
    <div ref={deletePageListRef} className="h-64 w-full border">
      {deletedPageList?.list.map(page => (
        <div key={page.id}>
          <div>{page.title}</div>
          <Button onClick={() => runRestorePage(page.id)}>Restore</Button>
        </div>
      ))}
    </div>
  )
}

export default TrashPage
