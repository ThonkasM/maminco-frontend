interface UsbEndpoint {
    endpointNumber: number
    direction: 'in' | 'out'
}

interface UsbAlternate {
    interfaceClass: number
    endpoints: UsbEndpoint[]
}

interface UsbInterface {
    interfaceNumber: number
    alternates: UsbAlternate[]
}

interface UsbConfiguration {
    interfaces: UsbInterface[]
}

export interface UsbDeviceLike {
    productName?: string
    manufacturerName?: string
    vendorId: number
    productId: number
    opened: boolean
    configuration: UsbConfiguration | null
    configurations: UsbConfiguration[]
    open(): Promise<void>
    selectConfiguration(value: number): Promise<void>
    claimInterface(interfaceNumber: number): Promise<void>
    releaseInterface(interfaceNumber: number): Promise<void>
    transferOut(endpointNumber: number, data: BufferSource): Promise<{ status: string }>
}

interface UsbApi {
    getDevices(): Promise<UsbDeviceLike[]>
    requestDevice(options: { filters: Array<{ classCode: number }> }): Promise<UsbDeviceLike>
}

const PRINTER_CLASS = 0x07
const CHUNK_SIZE = 4096
const STORAGE_KEY = 'maminco.printer'

function usbApi(): UsbApi | null {
    if (typeof navigator === 'undefined') return null
    const api = (navigator as unknown as { usb?: UsbApi }).usb
    return api ?? null
}

export function isWebUsbSupported(): boolean {
    return usbApi() !== null
}

export function printerLabel(device: UsbDeviceLike): string {
    const name = [device.manufacturerName, device.productName].filter(Boolean).join(' ').trim()
    return name || `USB ${device.vendorId.toString(16)}:${device.productId.toString(16)}`
}

function isPrinter(device: UsbDeviceLike): boolean {
    return (device.configurations ?? []).some((config) =>
        config.interfaces.some((iface) => iface.alternates.some((alt) => alt.interfaceClass === PRINTER_CLASS)),
    )
}

function rememberedKey(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY)
    } catch {
        return null
    }
}

function remember(device: UsbDeviceLike | null): void {
    try {
        if (device) window.localStorage.setItem(STORAGE_KEY, `${device.vendorId}:${device.productId}`)
        else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        return
    }
}

export async function getAuthorizedPrinter(): Promise<UsbDeviceLike | null> {
    const api = usbApi()
    if (!api) return null
    const printers = (await api.getDevices()).filter(isPrinter)
    if (printers.length === 0) return null
    const key = rememberedKey()
    return printers.find((d) => `${d.vendorId}:${d.productId}` === key) ?? printers[0]
}

export async function requestPrinter(): Promise<UsbDeviceLike> {
    const api = usbApi()
    if (!api) throw new Error('Este navegador no permite conectar impresoras USB. Usa Google Chrome o Microsoft Edge.')
    const device = await api.requestDevice({ filters: [{ classCode: PRINTER_CLASS }] })
    remember(device)
    return device
}

export function forgetPrinter(): void {
    remember(null)
}

function findOutEndpoint(device: UsbDeviceLike): { interfaceNumber: number; endpointNumber: number } {
    const config = device.configuration
    if (config) {
        for (const iface of config.interfaces) {
            for (const alt of iface.alternates) {
                if (alt.interfaceClass !== PRINTER_CLASS) continue
                const out = alt.endpoints.find((e) => e.direction === 'out')
                if (out) return { interfaceNumber: iface.interfaceNumber, endpointNumber: out.endpointNumber }
            }
        }
    }
    throw new Error('La impresora no expone un canal de escritura USB.')
}

export function describeUsbError(error: unknown): string {
    const name = error instanceof Error ? error.name : ''
    const message = error instanceof Error ? error.message : String(error)
    if (name === 'SecurityError' || /access denied|protected class/i.test(message)) {
        return 'El sistema operativo bloquea el acceso a la impresora. Cierra otros programas que la usen o, en Windows, instala el driver WinUSB (Zadig).'
    }
    if (name === 'NetworkError' || /unable to claim|in use|busy/i.test(message)) {
        return 'Otra aplicación está usando la impresora. Ciérrala y vuelve a intentar.'
    }
    if (name === 'NotFoundError') return 'No se encontró la impresora. Revisa que esté encendida y conectada.'
    return message
}

export async function sendToPrinter(device: UsbDeviceLike, data: Uint8Array): Promise<void> {
    if (!device.opened) await device.open()
    if (device.configuration === null) await device.selectConfiguration(1)
    const { interfaceNumber, endpointNumber } = findOutEndpoint(device)
    await device.claimInterface(interfaceNumber)
    try {
        for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
            const chunk = data.slice(offset, offset + CHUNK_SIZE)
            const result = await device.transferOut(endpointNumber, chunk)
            if (result.status !== 'ok') throw new Error(`La impresora rechazó los datos (${result.status}).`)
        }
    } finally {
        await device.releaseInterface(interfaceNumber).catch(() => undefined)
    }
}

export function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    return bytes
}
