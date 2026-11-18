import { getPushConfig, subscribePush, unsubscribePush } from './api'

export type PushSupport = 'unsupported' | 'denied' | 'default' | 'granted'

export function pushSupport(): PushSupport {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        return 'unsupported'
    }
    return Notification.permission
}

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (value.length % 4)) % 4)
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    const output = new Uint8Array(new ArrayBuffer(raw.length))
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
    return output
}

async function registration() {
    return navigator.serviceWorker.register('/sw.js')
}

export async function currentSubscription(): Promise<PushSubscription | null> {
    if (pushSupport() === 'unsupported') return null
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    return reg ? reg.pushManager.getSubscription() : null
}

export async function enablePush(): Promise<void> {
    const config = await getPushConfig()
    if (!config.webPublicKey) throw new Error('Las notificaciones push no están configuradas en el servidor.')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado en el navegador.')
    const reg = await registration()
    await navigator.serviceWorker.ready
    const subscription =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(config.webPublicKey),
        }))
    const json = subscription.toJSON()
    await subscribePush({
        kind: 'WEB',
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
    })
}

export async function disablePush(): Promise<void> {
    const subscription = await currentSubscription()
    if (!subscription) return
    await unsubscribePush(subscription.endpoint).catch(() => undefined)
    await subscription.unsubscribe()
}
