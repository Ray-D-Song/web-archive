import type { Folder } from '@web-archive/shared/types'
import fetcher from '~/utils/fetcher'

function getAllFolder(): Promise<Folder[]> {
  return fetcher<Folder[]>('/folders/all', {
    method: 'GET',
  })
}

function deleteFolder(id: number): Promise<Folder> {
  return fetcher<Folder>('/folders/delete', {
    method: 'DELETE',
    query: {
      id: id.toString(),
    },
  })
}

function createFolder(name: string): Promise<Folder> {
  return fetcher<Folder>('/folders/create', {
    method: 'POST',
    body: {
      name,
    },
  })
}

function updateFolder(id: number, name: string): Promise<Folder> {
  return fetcher<Folder>('/folders/update', {
    method: 'PUT',
    body: {
      id,
      name,
    },
  })
}

export {
  getAllFolder,
  deleteFolder,
  createFolder,
  updateFolder,
}
