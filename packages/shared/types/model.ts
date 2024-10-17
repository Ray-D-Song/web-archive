type Page = {
  id: number
  title: string
  contentUrl: string
  pageUrl: string
  folderId: number
  pageDesc: string
  isDeleted: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type Folder = {
  id: number
  name: string
  isDeleted: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type { Page, Folder }
