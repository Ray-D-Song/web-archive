import type { Page } from '@web-archive/shared/types'
import fetcher from '~/utils/fetcher'

function getPageDetail(id: string): Promise<Page> {
  return fetcher<Page>('/pages/get_page', {
    method: 'GET',
    query: {
      id,
    },
  })
}

function deletePage(page: Page): Promise<Page> {
  return fetcher<Page>('/pages/delete_page', {
    method: 'DELETE',
    query: {
      id: page.id.toString(),
    },
  })
}

function queryPage(body: {
  folderId: string
  pageNumber: number
  pageSize: number
  keyword: string
}): Promise<{
  list: Page[]
  total: number
}> {
  return fetcher<{
    list: Page[]
    total: number
  }>('/pages/query', {
    method: 'POST',
    body,
  })
}

function queryDeletedPage(): Promise<Page[]> {
  return fetcher<Page[]>('/pages/query_deleted', {
    method: 'POST',
  })
}

function restorePage(id: number): Promise<boolean> {
  return fetcher<boolean>('/pages/restore_page', {
    method: 'POST',
    body: {
      id,
    },
  })
}

function updatePage(body: {
  id: number
  folderId: number
}): Promise<Page> {
  return fetcher<Page>('/pages/update_page', {
    method: 'PUT',
    body,
  })
}

function clearDeletedPage(): Promise<boolean> {
  return fetcher<boolean>('/pages/clear_deleted', {
    method: 'DELETE',
  })
}

export {
  getPageDetail,
  deletePage,
  queryPage,
  updatePage,
  queryDeletedPage,
  restorePage,
  clearDeletedPage,
}
