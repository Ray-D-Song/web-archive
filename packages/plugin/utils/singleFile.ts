import { saveFile } from './file'

export interface LoadStage {
  PAGE_LOADING: 'page-loading'
  PAGE_LOADED: 'page-loaded'
  RESOURCES_INITIALIZING: 'resource-initializing'
  RESOURCES_INITIALIZED: 'resources-initialized'
  RESOURCE_LOADED: 'resource-loaded'
  PAGE_ENDED: 'page-ended'
  STAGE_STARTED: 'stage-started'
  STAGE_ENDED: 'stage-ended'
}

interface ProgressData extends LoadStage {
  type: LoadStage
  detail: {
    fram: boolean
    options: any
    pageURL: string
    step: number
  }
}

export interface SingleFileSetting {
  removeHiddenElements: boolean
  removeUnusedStyles: boolean
  removeUnusedFonts: boolean
  removeImports: boolean
  blockScripts: boolean
  blockAudios: boolean
  blockVideos: boolean
  compressHTML: boolean
  removeAlternativeFonts: boolean
  removeAlternativeMedias: boolean
  removeAlternativeImages: boolean
  groupDuplicateImages: boolean
  onprogress?: (data: ProgressData) => void
}

declare const extension: {
  getPageData: (
    options: SingleFileSetting
  ) => Promise<{
    content: string
    title: string
    filename: string
  }>
}

export async function getCurrentPageData(singleFileSetting?: SingleFileSetting) {
  const href = window.location.href
  const { content, title, filename } = await extension.getPageData({
    removeHiddenElements: true,
    removeUnusedStyles: true,
    removeUnusedFonts: true,
    removeImports: true,
    blockScripts: true,
    blockAudios: true,
    blockVideos: true,
    compressHTML: true,
    removeAlternativeFonts: true,
    removeAlternativeMedias: true,
    removeAlternativeImages: true,
    groupDuplicateImages: true,
    ...(singleFileSetting ?? {}),
  })

  const descriptionList = document.getElementsByName('description')
  const pageDesc = descriptionList?.[0]?.getAttribute('content') ?? ''

  return {
    content,
    title,
    filename,
    href,
    pageDesc,
  }
}

export async function saveCurrentPage() {
  const { content, title } = await getCurrentPageData()
  saveFile(content, {
    filename: `${title}.html`,
  })
}
