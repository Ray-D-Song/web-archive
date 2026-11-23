import { TooltipPortal } from '@radix-ui/react-tooltip'
import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@web-archive/shared/components/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { useRequest } from 'ahooks'
import { Check, Copy, Link2Off, Loader2, Share2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { createPageShareToken, getPageShareToken, revokePageShareToken } from '~/data/page'

interface SharePagePopoverProps {
  pageId: number
  variant?: 'outline' | 'secondary' | 'ghost' | 'default'
  size?: 'sm' | 'default' | 'icon'
}

function buildShareUrl(token: string) {
  return `${window.location.origin}/#/share/${token}`
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  }
  catch {
    return false
  }
}

function SharePagePopover({ pageId, variant = 'outline', size = 'sm' }: SharePagePopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { runAsync: ensureShareToken, loading: initLoading } = useRequest(
    async () => {
      const existing = await getPageShareToken(pageId)
      if (existing.token) {
        return existing.token
      }
      const created = await createPageShareToken(pageId)
      return created.token
    },
    {
      manual: true,
    },
  )

  const { runAsync: revokeShare, loading: revokeLoading } = useRequest(
    revokePageShareToken,
    {
      manual: true,
    },
  )

  const shareUrl = token ? buildShareUrl(token) : ''

  const handleCopy = async () => {
    if (!shareUrl)
      return
    const success = await copyToClipboard(shareUrl)
    if (success) {
      setCopied(true)
      toast.success(t('share-link-copied'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen)
      return

    try {
      const resolvedToken = await ensureShareToken()
      setToken(resolvedToken)
      const url = buildShareUrl(resolvedToken)
      if (await copyToClipboard(url)) {
        setCopied(true)
        toast.success(t('share-link-copied'))
        setTimeout(() => setCopied(false), 2000)
      }
    }
    catch {
      // fetcher displays error toast
    }
  }

  const handleRevoke = async () => {
    try {
      await revokeShare(pageId)
      setToken(null)
      setOpen(false)
      toast.success(t('share-revoked'))
    }
    catch {
      // fetcher displays error toast
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant={variant}
                size={size}
                onClick={e => e.stopPropagation()}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              {t('share-page')}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        align="end"
        className="w-80 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-sm font-medium">{t('share-page')}</div>
        {initLoading
          ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('generating-share-link')}</span>
            </div>
            )
          : (
              shareUrl && (
                <>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="h-8 text-xs"
                      onFocus={e => e.target.select()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      title={t('copy-link')}
                    >
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={revokeLoading}
                      onClick={handleRevoke}
                    >
                      <Link2Off className="w-4 h-4 mr-1.5" />
                      {t('cancel-share')}
                    </Button>
                  </div>
                </>
              )
            )}
      </PopoverContent>
    </Popover>
  )
}

export default SharePagePopover
