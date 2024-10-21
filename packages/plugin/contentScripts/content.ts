import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { getCurrentPageData } from '~/utils/singleFile'

onMessage('scrape-page-data', async ({ data: singleFileSetting }) => {
  return await getCurrentPageData({
    ...singleFileSetting,
    onprogress: (data) => {
      sendMessage('scrape-page-progress', { stage: data.type }, 'popup')
    },
  })
})
