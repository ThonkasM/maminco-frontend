import type { ChartImage } from '../model'

const STYLE_PROPS = [
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-dasharray',
    'stroke-linecap',
    'stroke-linejoin',
    'opacity',
    'font-size',
    'font-weight',
    'text-anchor',
    'dominant-baseline',
    'visibility',
    'display',
]

const FONT = 'Helvetica, Arial, sans-serif'

function inlineStyles(source: Element, target: Element) {
    const computed = getComputedStyle(source)
    const style = (target as SVGElement).style
    for (const prop of STYLE_PROPS) style.setProperty(prop, computed.getPropertyValue(prop))
    style.setProperty('font-family', FONT)
    for (let i = 0; i < source.children.length; i++) {
        inlineStyles(source.children[i], target.children[i])
    }
}

function pickChartSvg(root: Element): SVGSVGElement | null {
    let best: SVGSVGElement | null = null
    let area = 0
    root.querySelectorAll('svg').forEach((svg) => {
        const box = svg.getBoundingClientRect()
        if (box.width * box.height > area) {
            area = box.width * box.height
            best = svg
        }
    })
    return area > 2500 ? best : null
}

export function chartAvailable(selector: string): boolean {
    if (typeof document === 'undefined') return false
    const root = document.querySelector(selector)
    return Boolean(root && pickChartSvg(root))
}

export function resolveColor(value: string): string {
    if (typeof document === 'undefined') return value
    const host = document.createElement('div')
    host.className = 'export-theme'
    host.style.cssText = 'position:fixed;left:-99999px;top:0'
    const probe = document.createElement('span')
    probe.style.color = value
    host.appendChild(probe)
    document.body.appendChild(host)
    const resolved = getComputedStyle(probe).color
    host.remove()
    return resolved
}

/** Renders the on-screen chart as a JPEG on a white background, always with the light palette. */
export async function rasterizeChart(selector: string, scale = 2): Promise<ChartImage | null> {
    const root = document.querySelector(selector)
    const svg = root ? pickChartSvg(root) : null
    if (!svg) return null

    const box = svg.getBoundingClientRect()
    const width = Math.round(box.width)
    const height = Math.round(box.height)

    const host = document.createElement('div')
    host.className = 'export-theme'
    host.style.cssText = `position:fixed;left:-99999px;top:0;width:${width}px;height:${height}px;background:#fff`
    const clone = svg.cloneNode(true) as SVGSVGElement
    host.appendChild(clone)
    document.body.appendChild(host)

    try {
        inlineStyles(svg, clone)
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        clone.setAttribute('width', String(width))
        clone.setAttribute('height', String(height))
        if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${width} ${height}`)

        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        background.setAttribute('width', '100%')
        background.setAttribute('height', '100%')
        background.setAttribute('fill', '#ffffff')
        clone.insertBefore(background, clone.firstChild)

        const markup = new XMLSerializer().serializeToString(clone)
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.onerror = () => reject(new Error('No se pudo procesar el gráfico'))
                img.src = url
            })
            const canvas = document.createElement('canvas')
            canvas.width = width * scale
            canvas.height = height * scale
            const context = canvas.getContext('2d')
            if (!context) return null
            context.fillStyle = '#ffffff'
            context.fillRect(0, 0, canvas.width, canvas.height)
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
            return { dataUrl: canvas.toDataURL('image/jpeg', 0.92), width, height }
        } finally {
            URL.revokeObjectURL(url)
        }
    } finally {
        host.remove()
    }
}
