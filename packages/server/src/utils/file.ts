export async function formFileToArrayBuffer(file: File | string) {
  if (typeof file === 'string') {
    const encoder = new TextEncoder()
    return encoder.encode(file).buffer
  }
  else {
    return await file.arrayBuffer()
  }
}
