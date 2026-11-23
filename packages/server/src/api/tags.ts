import { buildGenerateTagMessage, isNil, isNumberString, parseTagsFromAIResponse } from '@web-archive/shared/utils'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import type { HonoTypeUserInformation } from '~/constants/binding'
import { deleteTagById, insertTag, selectAllTags, updateTag } from '~/model/tag'
import result from '~/utils/result'

const app = new Hono<HonoTypeUserInformation>()

app.get('/all', async (c) => {
  const tags = await selectAllTags(c.env.DB)

  return c.json(result.success(tags))
})

app.post(
  '/create',
  validator('json', (value, c) => {
    if (isNil(value.name) || typeof value.name !== 'string') {
      return c.json(result.error(400, 'Name is required'))
    }
    // todo check color type?
    return {
      name: value.name as string,
      color: value.color,
    }
  }),
  async (c) => {
    const { name, color = '#ffffff' } = c.req.valid('json')

    if (await insertTag(c.env.DB, { name, color })) {
      return c.json(result.success(true))
    }

    return c.json(result.error(500, 'Failed to create tag'))
  },
)

app.post(
  '/update',
  validator('json', (value, c) => {
    if (isNil(value.id) || !isNumberString(value.id)) {
      return c.json(result.error(400, 'ID is required'))
    }
    if (isNil(value.name) && isNil(value.color)) {
      return c.json(result.error(400, 'At least one field is required'))
    }

    return {
      id: Number(value.id),
      name: value.name,
      color: value.color,
    }
  }),
  async (c) => {
    const { id, name, color } = c.req.valid('json')

    if (await updateTag(c.env.DB, { id, name, color })) {
      return c.json(result.success(true))
    }

    return c.json(result.error(500, 'Failed to update tag'))
  },
)

app.delete(
  '/delete',
  validator('query', (value, c) => {
    if (isNil(value.id) || !isNumberString(value.id)) {
      return c.json(result.error(400, 'ID is required'))
    }
    return {
      id: Number(value.id),
    }
  }),
  async (c) => {
    const { id } = c.req.valid('query')

    if (await deleteTagById(c.env.DB, id)) {
      return c.json(result.success(true))
    }

    return c.json(result.error(500, 'Failed to delete tag'))
  },
)

app.post(
  '/generate_tag',
  validator('json', (value, c) => {
    const schema = z.object({
      title: z.string({ message: 'Title is required' }).min(1, { message: 'Title is required' }),
      pageDesc: z.string().default(''),
      model: z.string({ message: 'Model name is required' }).min(1, { message: 'Model name is required' }),
      tagLanguage: z.enum(['en', 'zh'], { message: 'Invalid tag language' }),
      preferredTags: z.array(z.string()).default([]),
    })
    const parsed = schema.safeParse(value)
    if (!parsed.success) {
      if (parsed.error.errors.length > 0) {
        return c.json(result.error(400, parsed.error.errors[0].message))
      }
      return c.json(result.error(400, 'Invalid request'))
    }
    return parsed.data
  }),
  async (c) => {
    const { title, pageDesc, model, tagLanguage, preferredTags } = c.req.valid('json')

    try {
      const res = await c.env.AI.run(
        // @ts-expect-error use BaseAiTextGenerationModels to check model? or use type assertion?
        model,
        {
          messages: buildGenerateTagMessage({ title, pageDesc, tagLanguage, preferredTags }),
        },
      )

      try {
        if (res instanceof ReadableStream) {
          throw new TypeError('Failed to parse response stream')
        }
        const tags = parseTagsFromAIResponse(res)
        return c.json(result.success(tags))
      }
      catch (error) {
        console.log(res)
        return c.json(result.error(500, 'Failed to parse response, please try again or change model'))
      }
    }
    catch (error) {
      if (error instanceof Error) {
        return c.json(result.error(500, error.message))
      }
      return c.json(result.error(500, 'Failed to generate tags'))
    }
  },
)

export default app
