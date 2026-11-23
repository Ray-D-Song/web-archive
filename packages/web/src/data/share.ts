import type { Page } from '@web-archive/shared/types'
import fetcher from '~/utils/fetcher'

function getSharedPageDetail(token?: string): Promise<Page | null> {
  return fetcher<Page | null>('/share/detail', {
    method: 'GET',
    query: {
      token: token ?? '',
    },
  })
}

export { getSharedPageDetail }
