const MAX_SIDE = 1600
const MAX_INPUT_BYTES = 12 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export const IMAGE_ACCEPT = ACCEPTED.join(',')

export class ImageValidationError extends Error {}

function loadBitmap(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const image = new Image()
        image.onload = () => {
            URL.revokeObjectURL(url)
            resolve(image)
        }
        image.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new ImageValidationError('No se pudo leer la imagen.'))
        }
        image.src = url
    })
}

/**
 * Validates a photo and shrinks it in the browser (max 1600 px, WebP) before uploading,
 * so a 6 MB phone picture travels as ~150 KB. The server then creates the final variants.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
    if (!ACCEPTED.includes(file.type)) throw new ImageValidationError('Usa una imagen JPG, PNG o WebP.')
    if (file.size > MAX_INPUT_BYTES) throw new ImageValidationError('La imagen pesa más de 12 MB.')

    const image = await loadBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
}

export function validateImageFile(file: File): void {
    if (!ACCEPTED.includes(file.type)) throw new ImageValidationError('Usa una imagen JPG, PNG o WebP.')
    if (file.size > MAX_INPUT_BYTES) throw new ImageValidationError('La imagen pesa más de 12 MB.')
}
