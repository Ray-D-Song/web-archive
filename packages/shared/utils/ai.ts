import type { AITagConfig } from 'types/config'

export type GenerateTagProps = {
  title: string
  pageDesc: string
} & AITagConfig

export function normalizeOpenAIApiUrl(apiUrl: string): string {
  const trimmed = apiUrl.trim().replace(/\/+$/, '')
  try {
    const url = new URL(trimmed)
    const pathname = url.pathname.replace(/\/+$/, '')
    if (pathname === '') {
      url.pathname = '/v1/chat/completions'
    }
    else if (pathname.endsWith('/v1')) {
      url.pathname = `${pathname}/chat/completions`
    }
    else {
      url.pathname = pathname
    }
    return url.toString()
  }
  catch {
    return trimmed
  }
}

function extractTagsArray(value: unknown): string[] | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const tags = (value as { tags?: unknown }).tags
  if (!Array.isArray(tags)) {
    return null
  }
  return tags
    .map(tag => String(tag).trim())
    .filter(Boolean)
    .slice(0, 5)
}

export function parseTagsFromAIResponse(raw: unknown): string[] {
  if (typeof raw === 'string') {
    const withoutThink = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
    const codeBlockMatch = withoutThink.match(/```(?:json)?([\s\S]*?)```/i)
    const cleaned = (codeBlockMatch ? codeBlockMatch[1] : withoutThink).trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    }
    catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || withoutThink.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse response, please try again or change model')
      }
      parsed = JSON.parse(jsonMatch[0])
    }

    const tags = extractTagsArray(parsed)
    if (!tags) {
      throw new Error('Failed to parse response, please try again or change model')
    }
    return tags
  }

  if (typeof raw === 'object' && raw !== null) {
    const directTags = extractTagsArray(raw)
    if (directTags) {
      return directTags
    }

    const record = raw as Record<string, unknown>
    if (record.response !== undefined && record.response !== null && record.response !== '') {
      return parseTagsFromAIResponse(record.response)
    }

    if (Array.isArray(record.choices) && record.choices.length > 0) {
      const firstChoice = record.choices[0] as { message?: { content?: unknown } } | undefined
      if (firstChoice?.message?.content) {
        return parseTagsFromAIResponse(firstChoice.message.content)
      }
    }

    if (record.result !== undefined && record.result !== null && record.result !== '') {
      return parseTagsFromAIResponse(record.result)
    }
  }

  throw new Error('Failed to parse response, please try again or change model')
}

export function buildGenerateTagMessage(props: {
  title: string
  pageDesc: string
  tagLanguage: string
  preferredTags: string[]
}) {
  return [
    {
      role: 'system' as const,
      content: generateChatCompletion(props.tagLanguage, props.preferredTags),
    },
    {
      role: 'user' as const,
      content: JSON.stringify({
        title: props.title,
        pageDesc: props.pageDesc,
      }),
    },
  ]
}

function generateChatCompletion(tagLanguage: string, preferredTags: string[]): string {
  return `What tags would you give to the input content? Please follow these rules:
    1. Use ${tagLanguage === 'zh' ? 'chinese' : 'english'} for most tags
    2. Keep common technical terms and abbreviations as-is
    3. Keep brand names in their original form
    4. Note that tags should be keywords related to the content, not explanations of the content
    5. Return format must be: {"tags": ["tag1", "tag2", ...]}
    6. Do not return any explanatory text
    7. Please prioritize these tags and add other relevant tags based on the content: [${preferredTags.join(', ')}]
    8. Keep tags concise and focused. Return no more than 5 tags in total
    9. Select the most representative and important tags only
  `
}

export async function generateTagByOpenAI(props: GenerateTagProps): Promise<Array<string>> {
  if (props.type !== 'openai') {
    throw new Error('Invalid AI tag config')
  }
  const res = await fetch(normalizeOpenAIApiUrl(props.apiUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${props.apiKey}`,
    },
    body: JSON.stringify({
      messages: buildGenerateTagMessage(props),
      model: props.model,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    let errorMessage = res.statusText || 'Request failed'
    try {
      const content = JSON.parse(text) as { error?: { message?: string }, message?: string }
      errorMessage = content?.error?.message || content?.message || errorMessage
    }
    catch {
      if (text.trim()) {
        errorMessage = text.trim()
      }
    }
    throw new Error(errorMessage)
  }

  try {
    const data = await res.json()
    return parseTagsFromAIResponse(data)
  }
  catch {
    throw new Error('Failed to parse response, please try again or change model')
  }
}
