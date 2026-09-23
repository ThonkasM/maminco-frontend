import Link from 'next/link'
import { buttonVariants } from '@/components/ui'

export const metadata = {
    title: 'Acceso denegado · Maminco',
}

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="max-w-md text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Acceso denegado
                </h1>
                <p className="mt-3 text-muted-foreground">
                    No tienes permiso para acceder a esta sección. Contacta al
                    administrador si crees que es un error.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                    <Link href="/" className={buttonVariants({ variant: 'primary' })}>
                        Ir al inicio
                    </Link>
                    <Link
                        href="/auth/login"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
