// Rasterizes the notation staff's SVG to a PNG by drawing it into an offscreen
// canvas (serialize SVG -> data URL -> Image -> canvas.drawImage -> PNG).

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () =>
      reject(new Error('Failed to rasterize the notation SVG.'))
    img.src = src
  })
}

/** abc2svg often emits width/height in inches (e.g. "9.88in"); normalize to CSS pixels. */
function parseSvgSize(attr: string | null, fallback: number): number {
  if (!attr) return fallback
  const n = parseFloat(attr)
  if (Number.isNaN(n)) return fallback
  if (attr.endsWith('in')) return n * 96
  if (attr.endsWith('cm')) return n * (96 / 2.54)
  if (attr.endsWith('mm')) return n * (96 / 25.4)
  return n
}

function resolveSvgSize(svg: SVGSVGElement): { width: number; height: number } {
  const attrW = parseSvgSize(
    svg.getAttribute('width'),
    svg.viewBox?.baseVal?.width || 0,
  )
  const attrH = parseSvgSize(
    svg.getAttribute('height'),
    svg.viewBox?.baseVal?.height || 0,
  )

  if (attrW > 0 && attrH > 0) return { width: attrW, height: attrH }

  const rect = svg.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height }
  }

  return {
    width: svg.viewBox?.baseVal?.width || 800,
    height: svg.viewBox?.baseVal?.height || 200,
  }
}

/** Locate the primary notation SVG inside GrooveNotation (edit or focus view). */
export function findNotationSvg(): SVGSVGElement | null {
  const root = document.querySelector('.groove-notation')
  if (!root) return null

  // Active NotationStaff sets id="notation-staff-svg" on its abc-host.
  const byId = root.querySelector(
    '#notation-staff-svg svg',
  ) as SVGSVGElement | null
  if (byId) return byId

  return (root.querySelector('.abc-host svg') as SVGSVGElement | null) ?? null
}

export async function exportSvgElementAsPng(
  svg: SVGSVGElement,
  filename: string,
  scale = 2,
): Promise<void> {
  const { width, height } = resolveSvgSize(svg)

  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  // Force printable black ink; on-screen theme CSS is not available in the blob.
  clone.setAttribute('color', 'black')
  clone.style.color = 'black'

  const background = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect',
  )
  background.setAttribute('x', '0')
  background.setAttribute('y', '0')
  background.setAttribute('width', String(width))
  background.setAttribute('height', String(height))
  background.setAttribute('fill', 'white')
  clone.insertBefore(background, clone.firstChild)

  const svgString = new XMLSerializer().serializeToString(clone)
  const url =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)

  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context is unavailable.')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0, width, height)

    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    // data: URLs do not need revoke; no-op for symmetry if we switch back to blob.
  }
}
