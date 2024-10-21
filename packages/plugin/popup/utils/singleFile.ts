import { isNil } from '@web-archive/shared/utils'
import type { SingleFileSetting } from '~/utils/singleFile'

export function getSingleFileSetting() {
  const setting = localStorage.getItem('single-file-setting')
  if (isNil(setting)) {
    return {
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
    }
  }
  return JSON.parse(setting) as SingleFileSetting
}

export function setSingleFileSetting(setting: SingleFileSetting) {
  localStorage.setItem('single-file-setting', JSON.stringify(setting))
}
