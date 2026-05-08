export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]

export const IMAGE_UPLOAD_ACCEPT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  ...SUPPORTED_IMAGE_MIME_TYPES,
].join(',')

export const SUPPORTED_IMAGE_FORMATS_LABEL = 'JPG, PNG, WEBP, or AVIF'

export function toDataUrl(file) {
  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(String(file?.type || '').toLowerCase())) {
    return Promise.reject(new Error('unsupported_image_type'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('file_read_failed'))
    reader.readAsDataURL(file)
  })
}