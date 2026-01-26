/**
 * Komprimiert ein Bild auf die angegebenen Abmessungen
 * @param file - Die zu komprimierende Bilddatei
 * @param maxWidth - Maximale Breite des Bildes (default: 1200px)
 * @param quality - Qualität des komprimierten Bildes 0-1 (default: 0.8)
 * @returns Ein Promise mit dem komprimierten Blob
 */
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Bild konnte nicht verarbeitet werden'))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
