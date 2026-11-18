import { ChefHat, ConciergeBell, LineChart, ShieldCheck, Wallet } from 'lucide-react'
import { LiveAppPreview } from '@/components/marketing/LiveAppPreview'
import { WoodBackground } from '@/components/marketing/WoodBackground'

const ROLES = [
  { icon: ShieldCheck, label: 'Administrador' },
  { icon: LineChart, label: 'Gerente' },
  { icon: Wallet, label: 'Cajero' },
  { icon: ConciergeBell, label: 'Mesero' },
  { icon: ChefHat, label: 'Cocinero' },
]

export function LoginShowcase() {
  return (
    <div className="dark relative isolate flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border-b-4 border-brand-leaf bg-wood p-10 text-foreground xl:p-14">
      <WoodBackground className="absolute inset-0 -z-20" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/30"
        aria-hidden="true"
      />

      <div className="animate-enter" style={{ ['--enter-delay' as string]: '120ms' }}>
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-ink">
          <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
          Un acceso, cinco roles
        </p>
        <h2 className="mt-4 max-w-md text-balance font-display text-4xl font-normal uppercase leading-[1.05] tracking-[0.005em] text-cream xl:text-5xl">
          Te llevamos directo a tu pantalla de trabajo
        </h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {ROLES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-cream/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-cream"
            >
              <Icon className="size-3.5 text-menu-green" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="animate-enter mt-10"
        style={{ ['--enter-delay' as string]: '260ms' }}
      >
        <div className="app-theme mx-auto max-w-lg rounded-xl text-foreground shadow-float ring-1 ring-white/10">
          <LiveAppPreview />
        </div>
      </div>
    </div>
  )
}
