import { Button } from '@web-archive/shared/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web-archive/shared/components/collapsible'
import { Input } from '@web-archive/shared/components/input'
import { ChevronDown } from 'lucide-react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@web-archive/shared/components/form'
import { useRequest } from 'ahooks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@web-archive/shared/components/select'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import AutoCompleteTagInput from '@web-archive/shared/components/auto-complete-tag-input'
import { useTranslation } from 'react-i18next'
import LoadingWrapper from './loading-wrapper'
import AITagTestConnectionButton from './ai-tag-test-connection-button'
import { getAITagConfig, setAITagConfig } from '~/data/config'
import TagContext from '~/store/tag'

function AITagSettingCollapsible() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const formSchema = z.discriminatedUnion('type', [
    z.object({
      type: z.literal('cloudflare'),
      tagLanguage: z.enum(['en', 'zh']),
      model: z.string().min(1, { message: t('model-name-is-required') }),
      preferredTags: z.array(z.string()),
    }),
    z.object({
      type: z.literal('openai'),
      tagLanguage: z.enum(['en', 'zh']),
      model: z.string().min(1, { message: t('model-name-is-required') }),
      preferredTags: z.array(z.string()),
      apiUrl: z.string().url({ message: t('please-enter-a-valid-api-url') }),
      apiKey: z.string().min(1, { message: t('api-key-is-required') }),
    }),
  ])

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      type: 'openai',
      tagLanguage: 'en',
      apiUrl: '',
      apiKey: '',
      model: '',
      preferredTags: [],
    },
    resolver: zodResolver(formSchema),
  })

  const { loading } = useRequest(
    getAITagConfig,
    {
      onSuccess: (data) => {
        form.reset(data)
      },
    },
  )

  const { run: setAITagConfigRun, loading: saveConfigLoading } = useRequest(setAITagConfig, {
    manual: true,
    onSuccess: () => {
      toast.success(t('ai-tag-config-saved'))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  async function validateForm() {
    return form.trigger()
  }

  const { tagCache } = useContext(TagContext)

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
            {t('ai-tag')}
          </div>
          <div>
            <ChevronDown size={24} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <LoadingWrapper loading={loading}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(setAITagConfigRun)}
              className="space-y-4 p-2"
            >
              <FormDescription>
                {t('aiTag-desc')}
              </FormDescription>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('aiTag-service-type')}</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select-service-type')}></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cloudflare">Cloudflare</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {t('aiTag-cloudflare-desc')}
                      <a className="font-bold underline" href="https://developers.cloudflare.com/workers-ai/platform/pricing/">
                        {t('aiTag-cloudflare-pricing')}
                      </a>
                      .
                    </FormDescription>
                  </FormItem>
                )}
              >
              </FormField>
              <FormField
                control={form.control}
                name="tagLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('aiTag-generate-tag-language')}
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select-generate-tag-language')}></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">简体中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              >
              </FormField>
              {
                form.watch('type') === 'openai' && (
                  <>
                    <FormField
                      control={form.control}
                      name="apiUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.openai.com/v1/chat/completions" {...field} />
                          </FormControl>
                          <FormMessage></FormMessage>
                        </FormItem>
                      )}
                    >
                    </FormField>
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input placeholder="API Key" {...field} />
                          </FormControl>
                          <FormMessage></FormMessage>
                        </FormItem>
                      )}
                    >
                    </FormField>
                  </>
                )
              }

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('model')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={form.watch('type') === 'cloudflare'
                          ? '@cf/mistral/mistral-7b-instruct-v0.1/...'
                          : 'gpt-4/gpt-4/...'}
                        {...field}
                      />
                    </FormControl>
                    {
                      form.watch('type') === 'cloudflare' && (
                        <FormDescription>
                          {t('aitag-model-desc')}
                          <a className="font-bold underline" href="https://developers.cloudflare.com/workers-ai/models/mistral-7b-instruct-v0.1/">mistral-7b-instruct-v0.1</a>
                          .
                        </FormDescription>
                      )
                    }
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              >
              </FormField>
              <FormField
                control={form.control}
                name="preferredTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('preferred-tags')}</FormLabel>
                    <FormControl>
                      <AutoCompleteTagInput
                        tags={tagCache ?? []}
                        selectTags={field.value.map(tag => ({ id: tag, name: tag }))}
                        onChange={({ bindTags }) => {
                          field.onChange(bindTags)
                        }}
                      >
                      </AutoCompleteTagInput>
                    </FormControl>
                  </FormItem>
                )}
              >

              </FormField>

              <div className="justify-between flex">
                <Button
                  disabled={saveConfigLoading}
                  type="submit"
                >
                  {t('save')}
                </Button>
                <AITagTestConnectionButton
                  config={form.watch()}
                  onValidate={validateForm}
                />
              </div>

            </form>
          </Form>
        </LoadingWrapper>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default AITagSettingCollapsible
