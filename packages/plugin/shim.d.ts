import type { ProtocolWithReturn } from 'webext-bridge'
import type { LoadStage, SingleFileSetting } from '~/utils/singleFile'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'get-basic-page-data': ProtocolWithReturn<{}, {
      title: string
      href: string
      pageDesc: string
    }>
    'add-save-page-task': ProtocolWithReturn<{
      tabId: number
      singleFileSetting: SingleFileSetting
      pageForm: {
        title: string
        pageDesc: string
        href: string
        folderId: string
        screenshot?: string
      }
    }, {}>
    'get-server-url': ProtocolWithReturn<{}, { serverUrl: string }>
    'set-server-url': ProtocolWithReturn<{ url: string }, { success: boolean }>
    'check-auth': ProtocolWithReturn<{}, { success: boolean }>
    'get-token': ProtocolWithReturn<{}, { token: string }>
    'set-token': ProtocolWithReturn<{ token: string }, { success: boolean }>
    'get-all-folders': ProtocolWithReturn<{}, { folders: Array<{ id: number, name: string }> }>
    'scrape-page-progress': ProtocolWithReturn<{ stage: LoadStage }, {}>
    'scrape-page-progress-to-popup': ProtocolWithReturn<{ stage: LoadStage }, {}>
    'scrape-page-data': ProtocolWithReturn<SingleFileSetting, { content: string, title: string, href: string, pageDesc: string }>
  }
}
