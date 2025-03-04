import { Button } from '@web-archive/shared/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web-archive/shared/components/collapsible'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js'
import { getContentByContentUrl, queryPage } from '~/data/page'

function ExportDataCollapsible() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExportAllData = async () => {
    if (!window.confirm(t('are-you-sure-to-export-all-data'))) {
      return
    }

    try {
      setExporting(true)
      // todo use stream?
      const allPageList = (await queryPage()).list

      const zipFileWriter = new BlobWriter()
      const zipWriter = new ZipWriter(zipFileWriter)
      for (const page of allPageList) {
        const content = await getContentByContentUrl(page.contentUrl)
        // todo safe path
        await zipWriter.add(`${page.id}-${page.title}`, new BlobReader(content))
      }
      await zipWriter.close()

      const zipBlob = await zipFileWriter.getData()

      const downloadLink = document.createElement('a')
      const url = URL.createObjectURL(zipBlob)

      const currentDate = new Date().toISOString().split('T')[0]
      downloadLink.download = `web-archive-data-${currentDate}.zip`
      downloadLink.href = url

      document.body.appendChild(downloadLink)
      downloadLink.click()

      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)
    }
    catch (error) {
      console.error('导出数据失败:', error)
      alert(t('export-failed'))
    }
    finally {
      setExporting(false)
    }
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="w-full space-y-2"
    >
      <CollapsibleTrigger asChild>
        <div
          className="w-full text-lg font-bold flex border-none justify-between items-center cursor-pointer"
        >
          <div>
            {t('data')}
          </div>
          <div>
            <ChevronDown size={24} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Button
          onClick={handleExportAllData}
          disabled={exporting}
        >
          {exporting ? t('exporting') : t('export-all-data')}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default ExportDataCollapsible
