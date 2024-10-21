import { Hono } from 'hono'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'

const app = new Hono<HonoTypeUserInformation>()

app.post(
  '',
  async (c) => {
    return c.json(result.success(true))
  },
)

export default app
