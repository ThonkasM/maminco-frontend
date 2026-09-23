import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Maminco — Sistema de gestión para restaurantes',
    short_name: 'Maminco',
    description:
      'Punto de venta, mesas y órdenes en tiempo real, pagos, caja y reportes para restaurantes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1411',
    theme_color: '#143f29',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
