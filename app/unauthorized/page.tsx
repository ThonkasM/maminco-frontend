import Link from 'next/link'

export const metadata = {
  title: 'Acceso denegado · Maminco',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-2">Acceso denegado</h1>
        <p className="text-slate-300 mb-8">
          No tienes permiso para acceder a esta sección. Contacta al administrador si crees que es
          un error.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Ir al inicio
          </Link>
          <Link
            href="/auth/login"
            className="border-2 border-slate-400 hover:border-white text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
