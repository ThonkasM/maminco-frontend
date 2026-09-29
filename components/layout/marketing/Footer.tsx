import Image from 'next/image'
import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: 'Producto',
    links: [
      { href: '#productos', label: 'Productos y servicios' },
      { href: '#caracteristicas', label: 'Características' },
      { href: '#planes', label: 'Planes' },
      { href: '#faq', label: 'Preguntas frecuentes' },
      { href: '#contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Módulos',
    links: [
      { href: '/auth/login', label: 'Iniciar sesión' },
      { href: '/dashboard', label: 'Panel administrativo' },
      { href: '/pos/tables', label: 'Punto de venta' },
      { href: '/payments', label: 'Pagos y caja' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Image
              src="/maminco-logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="text-lg font-semibold tracking-tight">Maminco</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Maminco Software S.R.L. desarrolla el sistema integral para
            restaurantes: punto de venta, mesas y órdenes en tiempo real, pagos,
            caja y reportes con pronósticos de ventas.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p className="flex items-center gap-1">
            <Link
              href="/tools/basis-path"
              aria-label="Abrir herramienta de camino básico"
              className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ©
            </Link>
            <span>
              {new Date().getFullYear()} Maminco Software S.R.L. Todos los derechos
              reservados.
            </span>
          </p>
          <p>Hecho para restaurantes de Bolivia · Precios en Bolivianos (Bs.)</p>
        </div>
      </div>
    </footer>
  )
}
