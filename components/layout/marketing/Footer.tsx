import Image from 'next/image'
import Link from 'next/link'
import { Mail, MessageCircle } from 'lucide-react'

const FOOTER_LINKS = [
  {
    title: 'Producto',
    links: [
      { href: '/#productos', label: 'Características' },
      { href: '/#como-funciona', label: 'Cómo funciona' },
      { href: '/#roles', label: 'Roles' },
      { href: '/#planes', label: 'Planes' },
    ],
  },
  {
    title: 'Acceso',
    links: [
      { href: '/auth/login', label: 'Iniciar sesión' },
      { href: '/dashboard', label: 'Panel administrativo' },
      { href: '/pos/tables', label: 'Punto de venta' },
      { href: '/payments', label: 'Pagos y caja' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { href: '/nosotros', label: 'Nosotros' },
      { href: '/#faq', label: 'Preguntas frecuentes' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terminos', label: 'Términos y condiciones' },
      { href: '/privacidad', label: 'Política de privacidad' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="dark relative overflow-hidden border-t-4 border-brand-leaf bg-wood-ink text-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Image src="/maminco-logo-128.png" alt="" width={32} height={32} className="size-8" />
            <span className="text-lg font-semibold tracking-tight">Maminco</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Maminco Software S.R.L. desarrolla el sistema integral para restaurantes: punto de
            venta, mesas y órdenes en tiempo real, pagos, caja, cocina y pronósticos de ventas.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href="mailto:contacto@maminco.bo"
              aria-label="Escribir un correo a Maminco"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Mail className="size-4" aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/59170000000"
              target="_blank"
              rel="noreferrer"
              aria-label="Escribir a Maminco por WhatsApp"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {group.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary dark:hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none select-none bg-gradient-to-b from-foreground/[0.07] to-transparent bg-clip-text text-center text-[22vw] font-semibold leading-[0.8] tracking-[-0.06em] text-transparent lg:text-[16rem]"
      >
        maminco
      </p>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p className="flex items-center gap-1">
            <Link
              href="/tools/basis-path"
              aria-label="Abrir herramienta de camino básico"
              className="rounded-sm transition-colors hover:text-primary-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ©
            </Link>
            <span>
              {new Date().getFullYear()} Maminco Software S.R.L. Hecho en Bolivia · Precios en
              Bolivianos (Bs.)
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
