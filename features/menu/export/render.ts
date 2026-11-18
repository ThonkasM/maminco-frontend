import { zipSync } from 'fflate'
import { downloadBlob } from '@/features/export/lib/download'
import { GEOMETRY, STORY_HEIGHT, STORY_WIDTH, paginate, type Measure, type StoryPage, type StorySection } from './layout'

const LEAF = '#4c8f21'
const MENU_GREEN = '#457e20'
const CHARCOAL = '#191919'
const CREAM = '#f4efe4'
const AMBER = '#e0953a'

export interface StoryAssets {
    display: string
    body: string
    logo: HTMLImageElement | null
    wood: HTMLImageElement | null
}

function resolveFamily(variable: string, fallback: string): string {
    const probe = document.createElement('span')
    probe.style.fontFamily = `var(${variable}), ${fallback}`
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    document.body.appendChild(probe)
    const family = getComputedStyle(probe).fontFamily
    probe.remove()
    return family
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => resolve(null)
        image.src = src
    })
}

export async function loadStoryAssets(): Promise<StoryAssets> {
    const display = resolveFamily('--font-anton', 'Impact, sans-serif')
    const body = resolveFamily('--font-josefin', 'system-ui, sans-serif')
    await Promise.all([
        document.fonts.load(`400 200px ${display}`),
        document.fonts.load(`600 40px ${body}`),
        document.fonts.load(`700 56px ${body}`),
    ]).catch(() => undefined)
    const [logo, wood] = await Promise.all([loadImage('/menu-arch-logo.png'), loadImage('/menu-wood.jpg')])
    return { display, body, logo, wood }
}

function mulberry32(seed: number) {
    let a = seed
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** Dark planks with grain, seams and a couple of knots, drawn once and reused on every page. */
/** Tiles the real wood photo (mirrored horizontally so seams disappear); falls back to procedural planks. */
function drawWood(width: number, height: number, photo: HTMLImageElement | null): HTMLCanvasElement {
    if (photo) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
            const scale = height / photo.height
            const tile = photo.width * scale
            for (let x = 0, i = 0; x < width; x += tile, i++) {
                ctx.save()
                if (i % 2 === 1) {
                    ctx.translate(x + tile, 0)
                    ctx.scale(-1, 1)
                    ctx.drawImage(photo, 0, 0, tile, height)
                } else ctx.drawImage(photo, x, 0, tile, height)
                ctx.restore()
            }
            return canvas
        }
    }
    return drawProceduralWood(width, height)
}

function drawProceduralWood(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas
    const random = mulberry32(11)
    const planks = [300, 250, 290, 240]
    let x = 0
    let i = 0
    while (x < width) {
        const w = planks[i % planks.length]
        const base = 34 + Math.round(random() * 10)
        const gradient = ctx.createLinearGradient(x, 0, x + w, 0)
        gradient.addColorStop(0, `rgb(${base + 6},${base - 8},${base - 14})`)
        gradient.addColorStop(1, `rgb(${base},${base - 12},${base - 18})`)
        ctx.fillStyle = gradient
        ctx.fillRect(x, 0, w, height)
        for (let k = 0; k < 200; k++) {
            const gx = x + random() * w
            const light = random() > 0.72
            ctx.strokeStyle = light ? `rgba(120,84,60,${0.05 + random() * 0.08})` : `rgba(10,6,4,${0.08 + random() * 0.2})`
            ctx.lineWidth = 1 + random() * 2.4
            ctx.beginPath()
            const phase = random() * 6
            for (let y = 0; y <= height; y += 40) {
                const wobble = Math.sin(y / 180 + phase) * 4
                if (y === 0) ctx.moveTo(gx + wobble, y)
                else ctx.lineTo(gx + wobble, y)
            }
            ctx.stroke()
        }
        for (let k = 0; k < 2; k++) {
            const kx = x + 40 + random() * (w - 80)
            const ky = random() * height
            const knot = ctx.createRadialGradient(kx, ky, 2, kx, ky, 60)
            knot.addColorStop(0, 'rgba(8,4,2,0.75)')
            knot.addColorStop(1, 'rgba(8,4,2,0)')
            ctx.fillStyle = knot
            ctx.save()
            ctx.translate(kx, ky)
            ctx.scale(0.6, 1.8)
            ctx.translate(-kx, -ky)
            ctx.beginPath()
            ctx.arc(kx, ky, 60, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }
        ctx.fillStyle = 'rgba(8,4,2,0.9)'
        ctx.fillRect(x + w - 4, 0, 4, height)
        x += w
        i++
    }
    return canvas
}

function fontFor(kind: 'item' | 'note', assets: StoryAssets) {
    return kind === 'item' ? `600 42px ${assets.body}` : `600 31px ${assets.body}`
}

function makeMeasure(ctx: CanvasRenderingContext2D, assets: StoryAssets): Measure {
    return {
        wrap: (text, width, kind) => {
            ctx.font = fontFor(kind, assets)
            const words = text.split(/\s+/)
            const lines: string[] = []
            let current = ''
            for (const word of words) {
                const attempt = current ? `${current} ${word}` : word
                if (ctx.measureText(attempt).width > width && current) {
                    lines.push(current)
                    current = word
                } else current = attempt
            }
            if (current) lines.push(current)
            return lines
        },
    }
}

function drawPage(page: StoryPage, index: number, total: number, assets: StoryAssets, wood: HTMLCanvasElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = STORY_WIDTH
    canvas.height = STORY_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas
    const g = GEOMETRY

    ctx.drawImage(wood, 0, g.headerHeight)
    ctx.fillStyle = CHARCOAL
    ctx.fillRect(0, 0, STORY_WIDTH, g.headerHeight)

    ctx.fillStyle = MENU_GREEN
    ctx.font = `400 214px ${assets.display}`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('MENÚ', 64, 228)

    // Arch with the logo and tagline, cropped from the printed menu.
    if (assets.logo) {
        const w = 300
        const h = (assets.logo.height / assets.logo.width) * w
        ctx.drawImage(assets.logo, STORY_WIDTH - w - 6, g.headerHeight + 6 - h, w, h)
    }
    ctx.fillStyle = LEAF
    ctx.fillRect(0, g.headerHeight - 4, STORY_WIDTH, 14)

    for (const block of page.blocks) {
        if (block.kind === 'section') {
            ctx.font = `700 52px ${assets.body}`
            ctx.letterSpacing = '4px'
            const width = Math.max(330, ctx.measureText(block.name.toUpperCase()).width + 110)
            ctx.fillStyle = '#120b09'
            ctx.beginPath()
            ctx.roundRect(30, block.y, width, g.sectionHeight, 36)
            ctx.fill()
            ctx.fillStyle = MENU_GREEN
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(block.name.toUpperCase(), 30 + width / 2 + 2, block.y + g.sectionHeight / 2 + 3)
            ctx.letterSpacing = '0px'
            ctx.textAlign = 'left'
        } else if (block.kind === 'item') {
            ctx.font = fontFor('item', assets)
            ctx.letterSpacing = '1.5px'
            ctx.fillStyle = CREAM
            ctx.textBaseline = 'middle'
            block.lines.forEach((line, lineIndex) => ctx.fillText(line, g.marginX, block.y + g.itemPad / 2 + g.itemLine * (lineIndex + 0.5)))
            ctx.fillText(block.price, g.priceX, block.y + block.height / 2)
            ctx.letterSpacing = '0px'
        } else {
            const x = STORY_WIDTH - g.noteWidth
            ctx.fillStyle = CHARCOAL
            ctx.fillRect(x, block.y, g.noteWidth, block.height)
            ctx.fillStyle = LEAF
            ctx.fillRect(x, block.y, g.noteWidth, 12)
            ctx.fillRect(x, block.y, 12, block.height)
            ctx.font = fontFor('note', assets)
            ctx.letterSpacing = '1px'
            ctx.fillStyle = AMBER
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            block.lines.forEach((line, lineIndex) =>
                ctx.fillText(line, x + g.noteWidth / 2 + 6, block.y + g.notePad + 6 + g.noteLine * (lineIndex + 0.5)),
            )
            ctx.letterSpacing = '0px'
            ctx.textAlign = 'left'
        }
    }

    if (total > 1) {
        ctx.font = `600 26px ${assets.body}`
        ctx.fillStyle = 'rgba(244,239,228,0.7)'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(`${index + 1}/${total}`, g.marginX, STORY_HEIGHT - 30)
    }
    return canvas
}

export async function renderStoryPages(sections: StorySection[], note: string | null): Promise<HTMLCanvasElement[]> {
    const assets = await loadStoryAssets()
    const probe = document.createElement('canvas').getContext('2d')
    if (!probe) return []
    const pages = paginate(sections, note, makeMeasure(probe, assets))
    const wood = drawWood(STORY_WIDTH, STORY_HEIGHT - GEOMETRY.headerHeight, assets.wood)
    return pages.map((page, index) => drawPage(page, index, pages.length, assets, wood))
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))), type, quality))

export async function downloadStory(canvases: HTMLCanvasElement[], format: 'png' | 'pdf') {
    if (canvases.length === 0) throw new Error('No hay productos disponibles para exportar.')
    if (format === 'png') {
        if (canvases.length === 1) {
            downloadBlob(await toBlob(canvases[0], 'image/png'), 'carta-maminco.png')
            return
        }
        const files: Record<string, Uint8Array> = {}
        for (let i = 0; i < canvases.length; i++) {
            files[`carta-maminco-${i + 1}.png`] = new Uint8Array(await (await toBlob(canvases[i], 'image/png')).arrayBuffer())
        }
        downloadBlob(new Blob([zipSync(files).buffer as ArrayBuffer], { type: 'application/zip' }), 'carta-maminco.zip')
        return
    }
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [STORY_WIDTH, STORY_HEIGHT], compress: true, hotfixes: ['px_scaling'] })
    canvases.forEach((canvas, index) => {
        if (index > 0) pdf.addPage([STORY_WIDTH, STORY_HEIGHT], 'portrait')
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, STORY_WIDTH, STORY_HEIGHT)
    })
    downloadBlob(pdf.output('blob'), 'carta-maminco.pdf')
}
