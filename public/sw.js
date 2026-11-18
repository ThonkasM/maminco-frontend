self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
    let data = {}
    try {
        data = event.data ? event.data.json() : {}
    } catch {
        data = { title: 'Maminco', body: event.data ? event.data.text() : '' }
    }
    event.waitUntil(
        self.registration.showNotification(data.title || 'Maminco', {
            body: data.body || '',
            icon: '/maminco-logo-128.png',
            badge: '/maminco-logo-128.png',
            tag: data.notificationId || undefined,
            data: { url: data.url || '/' },
        }),
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = (event.notification.data && event.notification.data.url) || '/'
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
            for (const client of windows) {
                if ('focus' in client) {
                    client.navigate(url)
                    return client.focus()
                }
            }
            return self.clients.openWindow(url)
        }),
    )
})
