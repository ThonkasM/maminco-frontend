import { describe, expect, it, vi } from 'vitest'
import { base64ToBytes, describeUsbError, sendToPrinter, type UsbDeviceLike } from '@/lib/printing/webusb'

function fakeDevice(overrides: Partial<UsbDeviceLike> = {}) {
    const transferOut = vi.fn().mockResolvedValue({ status: 'ok' })
    const claimInterface = vi.fn().mockResolvedValue(undefined)
    const releaseInterface = vi.fn().mockResolvedValue(undefined)
    const device = {
        vendorId: 0x1504,
        productId: 0x3d,
        opened: true,
        configuration: {
            interfaces: [
                {
                    interfaceNumber: 0,
                    alternates: [
                        {
                            interfaceClass: 7,
                            endpoints: [
                                { endpointNumber: 1, direction: 'in' },
                                { endpointNumber: 2, direction: 'out' },
                            ],
                        },
                    ],
                },
            ],
        },
        configurations: [],
        open: vi.fn().mockResolvedValue(undefined),
        selectConfiguration: vi.fn().mockResolvedValue(undefined),
        claimInterface,
        releaseInterface,
        transferOut,
        ...overrides,
    } as unknown as UsbDeviceLike
    return { device, transferOut, claimInterface, releaseInterface }
}

describe('webusb', () => {
    it('decodes base64 into bytes', () => {
        expect(Array.from(base64ToBytes('G0BB'))).toEqual([0x1b, 0x40, 0x41])
    })

    it('sends data in chunks to the OUT endpoint and releases the interface', async () => {
        const { device, transferOut, claimInterface, releaseInterface } = fakeDevice()
        await sendToPrinter(device, new Uint8Array(10000))
        expect(claimInterface).toHaveBeenCalledWith(0)
        expect(transferOut).toHaveBeenCalledTimes(3)
        expect(transferOut.mock.calls[0][0]).toBe(2)
        expect(releaseInterface).toHaveBeenCalledWith(0)
    })

    it('releases the interface and throws when the printer rejects data', async () => {
        const { device, transferOut, releaseInterface } = fakeDevice()
        transferOut.mockResolvedValue({ status: 'stall' })
        await expect(sendToPrinter(device, new Uint8Array(10))).rejects.toThrow('stall')
        expect(releaseInterface).toHaveBeenCalled()
    })

    it('explains common USB errors in Spanish', () => {
        const busy = Object.assign(new Error('Unable to claim interface'), { name: 'NetworkError' })
        expect(describeUsbError(busy)).toContain('Otra aplicación')
        const denied = Object.assign(new Error('Access denied'), { name: 'SecurityError' })
        expect(describeUsbError(denied)).toContain('bloquea')
    })
})
