import { useRef } from 'react'
import type { AutoCompleteTagInputRef } from '@web-archive/shared/components/auto-complete-tag-input'
import AutoCompleteTagInput from '@web-archive/shared/components/auto-complete-tag-input'
import { Button } from '@web-archive/shared/components/button'
import type { GenerateTagProps } from '@web-archive/shared/utils'
import { generateTagByOpenAI } from '@web-archive/shared/utils'
import { useRequest } from 'ahooks'
import { AlertCircleIcon, Loader2Icon, SparklesIcon } from 'lucide-react'
import { sendMessage } from 'webext-bridge/popup'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

async function getAllTags() {
  const { tags } = await sendMessage('get-all-tags', {})
  return tags
}

async function getAITagConfig() {
  const { aiTagConfig } = await sendMessage('get-ai-tag-config', {})
  return aiTagConfig
}

async function doGenerateTag(props: GenerateTagProps, errorMessage: string) {
  if (!props.model) {
    toast.error(errorMessage)
    throw new Error('Invalid AI tag config')
  }
  if (props.type === 'cloudflare') {
    const { tags } = await sendMessage('generate-tag', props)
    return tags
  }
  return await generateTagByOpenAI(props)
}

interface TagInputWithCacheProps {
  title: string
  description: string
  onValueChange: (value: string[]) => void
}

function TagInputWithCache({ onValueChange, title, description }: TagInputWithCacheProps) {
  const { t } = useTranslation()
  const tagInputRef = useRef<AutoCompleteTagInputRef>(null)
  const { data: tagList } = useRequest(getAllTags, {
    cacheKey: 'tagList',
    setCache: (data) => {
      localStorage.setItem('tagList', JSON.stringify(data))
    },
    getCache: () => {
      const cache = localStorage.getItem('tagList')
      return cache ? JSON.parse(cache) : []
    },
  })

  const { data: aiTagConfig } = useRequest(getAITagConfig, {
    cacheKey: 'aiTagConfig',
    setCache: (data) => {
      localStorage.setItem('aiTagConfig', JSON.stringify(data))
    },
    getCache: () => {
      const cache = localStorage.getItem('aiTagConfig')
      return cache ? JSON.parse(cache) : undefined
    },
  })

  const { run: generateTagRun, loading: generateTagRunning, error: generateTagError } = useRequest(
    doGenerateTag,
    {
      manual: true,
      onSuccess: (data) => {
        tagInputRef.current?.addTags(data)
      },
      onError: (error) => {
        console.error(error)
        toast.error(error?.message)
      },
    },
  )

  return (
    <div className="flex space-x-2">
      <AutoCompleteTagInput
        ref={tagInputRef}
        tags={tagList ?? []}
        shouldLimitHeight
        onChange={({ bindTags }) => {
          onValueChange(bindTags)
        }}
      >
      </AutoCompleteTagInput>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="w-12 h-10 "
              variant="secondary"
              size="icon"
              disabled={generateTagRunning}
              onClick={() => {
                generateTagRun({
                  ...aiTagConfig,
                  title,
                  pageDesc: description,
                }, t('ai-tag-not-configured'))
              }}
            >
              {
                generateTagRunning
                  ? <Loader2Icon size={18} className="animate-spin"></Loader2Icon>
                  : (
                      generateTagError
                        ? <AlertCircleIcon size={18} className="text-destructive"></AlertCircleIcon>
                        : <SparklesIcon size={18} className="opacity-80"></SparklesIcon>
                    )
              }
            </Button>
          </TooltipTrigger>
          {
            generateTagError && (
              <TooltipContent>
                {generateTagError.message}
              </TooltipContent>
            )
          }
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default TagInputWithCache
