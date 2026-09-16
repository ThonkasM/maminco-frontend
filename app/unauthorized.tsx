import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-4xl font-bold text-white mb-2">Acceso Denegado</h1>
        <p className="text-slate-300 mb-8">No tienes permiso para acceder a esta sección. Por favor, contacta al administrador si crees que esto es un error.</p>
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
