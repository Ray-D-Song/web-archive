export function saveFile(content: string, options: { filename: string, type?: string }) {
  const { filename, type = 'text/html' } = options
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function base64ToBlob(base64: string, type = 'image/png'): Blob {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = Array.from({ length: byteCharacters.length })
    .map((_, i) => byteCharacters.charCodeAt(i))
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type })
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}
