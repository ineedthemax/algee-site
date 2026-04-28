// Algee Smith — Push Notification Service Worker

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Algee Smith', body: event.data.text() }
  }

  const title   = payload.title ?? 'Algee Smith'
  const options = {
    body:    payload.body  ?? '',
    icon:    payload.icon  ?? '/images/algee-1.jpg',
    badge:   payload.badge ?? '/images/algee-1.jpg',
    image:   payload.image ?? undefined,
    data:    { url: payload.url ?? '/' },
    vibrate: [100, 50, 100],
    actions: payload.actions ?? [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
