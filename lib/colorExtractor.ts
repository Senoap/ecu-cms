// lib/colorExtractor.ts

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
}

export function extractDominantColor(imgSrc: string): Promise<string> {
  return extractColorPalette(imgSrc).then((palette) => palette.primary)
}

export function extractColorPalette(imgSrc: string): Promise<ColorPalette> {
  return new Promise((resolve) => {
    const fallback: ColorPalette = {
      primary: '#7E1D0C',
      secondary: '#D4AF37',
      accent: '#1E293B'
    }

    if (!imgSrc) {
      resolve(fallback)
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imgSrc

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(fallback)
          return
        }

        canvas.width = 60
        canvas.height = 60
        ctx.drawImage(img, 0, 0, 60, 60)

        const imageData = ctx.getImageData(0, 0, 60, 60).data
        const colorBuckets: { r: number; g: number; b: number; count: number; lum: number }[] = []

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i]
          const g = imageData[i + 1]
          const b = imageData[i + 2]
          const a = imageData[i + 3]

          // Ignore transparent and pure white/light grey background pixels
          if (a < 128) continue
          if (r > 245 && g > 245 && b > 245) continue

          const lum = 0.299 * r + 0.587 * g + 0.114 * b

          // Find if close to existing bucket
          let found = false
          for (const bucket of colorBuckets) {
            const diff = Math.abs(bucket.r - r) + Math.abs(bucket.g - g) + Math.abs(bucket.b - b)
            if (diff < 45) {
              bucket.r = Math.floor((bucket.r * bucket.count + r) / (bucket.count + 1))
              bucket.g = Math.floor((bucket.g * bucket.count + g) / (bucket.count + 1))
              bucket.b = Math.floor((bucket.b * bucket.count + b) / (bucket.count + 1))
              bucket.count++
              found = true
              break
            }
          }

          if (!found) {
            colorBuckets.push({ r, g, b, count: 1, lum })
          }
        }

        if (colorBuckets.length === 0) {
          resolve(fallback)
          return
        }

        // Sort by frequency
        colorBuckets.sort((a, b) => b.count - a.count)

        const toHex = (r: number, g: number, b: number) =>
          `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`

        // Primary: most frequent saturated or non-white color
        const primary = toHex(colorBuckets[0].r, colorBuckets[0].g, colorBuckets[0].b)

        // Secondary: second distinct color, preferably vibrant/gold or lighter
        let secondary = '#D4AF37'
        if (colorBuckets.length > 1) {
          const second = colorBuckets[1]
          secondary = toHex(second.r, second.g, second.b)
        }

        // Accent / Tertiary: contrast tone (executive deep slate or navy)
        let accent = '#1E293B'
        if (colorBuckets.length > 2) {
          const third = colorBuckets[2]
          accent = toHex(third.r, third.g, third.b)
        }

        resolve({
          primary,
          secondary,
          accent
        })
      } catch {
        resolve(fallback)
      }
    }

    img.onerror = () => {
      resolve(fallback)
    }
  })
}