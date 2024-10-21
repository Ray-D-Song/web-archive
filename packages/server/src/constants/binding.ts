export type Bindings = {
  JWT_SECRET: string
  DB: D1Database
  KV: KVNamespace
  BUCKET: R2Bucket
  BEARER_TOKEN: string
}

export type HonoTypeUserInformation = {
  Bindings: Bindings
}
