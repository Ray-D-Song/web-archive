import { Buffer } from 'node:buffer'
import { isNil } from '@web-archive/shared/utils'

export async function formFileToArrayBuffer(file: File | string) {
  if (typeof file === 'string') {
    const encoder = new TextEncoder()
    return encoder.encode(file).buffer
  }
  else {
    return await file.arrayBuffer()
  }
}

export async function saveFileToBucket(BUCKET: R2Bucket, file: File | string) {
  if (isNil(file)) {
    return
  }
  const id = crypto.randomUUID()
  const fileArraybuffer = await formFileToArrayBuffer(file)
  const uploadFileResult = await BUCKET.put(id, fileArraybuffer)
  if (uploadFileResult === null) {
    return
  }
  return id
}

export async function getFileFromBucket(BUCKET: R2Bucket, id: string) {
  return await BUCKET.get(id)
}

export async function getBase64FileFromBucket(BUCKET: R2Bucket, id: string, type?: string) {
  const file = await getFileFromBucket(BUCKET, id)
  if (isNil(file)) {
    return
  }
  const blob = await file.blob()
  return await blobToBase64(blob, type)
}

export async function blobToBase64(blob: Blob, type?: string) {
  const buffer = await blob.arrayBuffer()
  const base64String = Buffer.from(buffer).toString('base64')
  return `data:${type ?? blob.type};base64,${base64String}`
}
